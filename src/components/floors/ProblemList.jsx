// src/components/floors/ProblemList.jsx
import { useEffect, useState, useMemo } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 🔹 알림(경고/주의)용 시간: HH:MM:SS
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// 🔹 요청용 시간: MM월 DD일 HH시
function formatRequestTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  return `${month}월 ${day}일 ${hour}시`;
}

const METRIC_LABEL = {
  elec: "전기",
  water: "수도",
  gas: "가스",
  temp: "온도",
};

// 층 문자열 통일 ("8F", "8층", "지하 2층", "B2" 등 → "8F" / "B2")
function normalizeFloor(value) {
  if (!value) return null;
  const s = String(value).trim();

  // B2, B10
  if (/^B\d+$/i.test(s)) {
    const n = s.replace(/[^0-9]/g, "");
    return `B${n}`;
  }

  // "지하 2층", "-2층" 등
  if (/지하/.test(s) || s.startsWith("-")) {
    const m = s.match(/(\d+)/);
    if (!m) return null;
    return `B${m[1]}`;
  }

  // 나머지: "8F", "8층", "8" → 8F
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = m[1];
  return `${n}F`;
}

/**
 * RTDB에 저장된 reason 코드 → 한글 설명
 */
function getReasonText(reason, metric) {
  if (!reason) return "";

  const metricLabel = METRIC_LABEL[metric] || "";

  switch (reason) {
    case "strong_overload_from_normal":
      return `${metricLabel} 사용량이 기준 대비 크게 증가하여 경고 단계로 전환되었습니다.`;
    case "sustained_caution_from_normal":
      return `${metricLabel} 사용량이 기준치를 초과한 상태가 지속되어 주의 단계로 전환되었습니다.`;
    case "strong_overload_from_caution":
      return `${metricLabel} 사용량이 더 증가하여 경고 단계로 격상되었습니다.`;
    case "long_caution_escalation":
      return `${metricLabel} 주의 상태가 장시간 지속되어 경고 단계로 격상되었습니다.`;
    case "caution_cleared":
      return `${metricLabel} 사용량이 다시 기준 범위로 돌아와 주의 상태가 해제되었습니다.`;
    case "downgraded_from_warning":
      return `${metricLabel} 경고 상태가 완화되어 주의 단계로 내려갔습니다.`;

    case "overload_from_normal":
      return `${metricLabel} 사용량이 기준치를 초과했습니다.`;

    case "sustained_caution_from_normal_old":
    case "sustained_caution_from_normal_v1":
    case "sustained_caution_from_normal_legacy":
    case "sustained_warning_from_normal":
      return `${metricLabel} 주의/경고 상태가 일정 시간 이상 지속되었습니다.`;

    case "back_to_normal_from_caution":
      return `${metricLabel}가(이) 주의 상태에서 정상으로 복귀했습니다.`;
    case "back_to_normal_from_warning":
      return `${metricLabel}가(이) 경고 상태에서 정상으로 복귀했습니다.`;

    // ✅ 하루 1회 재알림(유지) reason 추가
    case "still_caution":
      return `${metricLabel} 주의 상태가 다음날에도 지속되고 있습니다.`;
    case "still_warning":
      return `${metricLabel} 경고 상태가 다음날에도 지속되고 있습니다.`;

    default:
      return "이상 상태가 감지되었습니다.";
  }
}

export default function ProblemList({ floor }) {
  const [alertItems, setAlertItems] = useState([]);
  const [requestItems, setRequestItems] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const loading = loadingAlerts || loadingRequests;
  const normalizedFloor = normalizeFloor(floor);

  // 알림 + 요청 합친 리스트
  const items = useMemo(() => {
    const merged = [...alertItems, ...requestItems];
    merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return merged;
  }, [alertItems, requestItems]);

  // 🔹 alerts/{normalizedFloor}/{today} (오늘 알림만)
  useEffect(() => {
    if (!floor || !normalizedFloor) {
      setAlertItems([]);
      setLoadingAlerts(false);
      return;
    }

    let isMounted = true;
    const todayKey = formatDateKey(new Date());

    // ✅ 여기 핵심: floor가 아니라 normalizedFloor로 읽기
    const alertsRef = ref(rtdb, `alerts/${normalizedFloor}/${todayKey}`);

    setLoadingAlerts(true);

    const unsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        if (!isMounted) return;

        const list = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const val = child.val() || {};
            list.push({
              id: child.key,
              kind: "alert",
              createdAt: val.createdAt,
              level: val.level,
              metric: val.metric,
              reason: val.reason,
              value: val.value,
            });
          });
        }

        setAlertItems(list);
        setLoadingAlerts(false);
      },
      (err) => {
        console.error("ProblemList alerts onValue error:", err);
        if (!isMounted) return;
        setAlertItems([]);
        setLoadingAlerts(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [floor, normalizedFloor]);

  // 🔹 requests: 날짜 상관 없이 이 층 요청 전부 (완료는 제외)
  useEffect(() => {
    if (!floor || !normalizedFloor) {
      setRequestItems([]);
      setLoadingRequests(false);
      return;
    }

    let isMounted = true;
    const requestsRef = ref(rtdb, "requests");

    setLoadingRequests(true);

    const unsubscribe = onValue(
      requestsRef,
      (snapshot) => {
        if (!isMounted) return;

        const list = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const val = child.val() || {};

            // 층 매칭
            const reqFloorNorm = normalizeFloor(val.floor);
            if (!reqFloorNorm || reqFloorNorm !== normalizedFloor) return;

            // ✅ 완료(status === "완료") 요청은 표시/집계 안 함
            if (val.status === "완료") return;

            list.push({
              id: child.key,
              kind: "request",
              createdAt: val.createdAt,
              status: val.status, // "접수", "완료" 등
              metric: val.type, // "전기", "온도" 등
              title: val.title,
              content: val.content,
            });
          });
        }

        setRequestItems(list);
        setLoadingRequests(false);
      },
      (err) => {
        console.error("ProblemList requests onValue error:", err);
        if (!isMounted) return;
        setRequestItems([]);
        setLoadingRequests(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [floor, normalizedFloor]);

  // 뱃지 색상
  const levelColor = (item) => {
    if (item.kind === "request") {
      return "bg-[#88C5F7]";
    }
    if (item.level === "warning") return "bg-[#FF7070]";
    if (item.level === "caution") return "bg-[#FFD85E]";
    return "bg-[#88C5F7]";
  };

  // 뱃지 텍스트
  const levelText = (item) => {
    if (item.kind === "request") {
      if (item.status) return `요청·${item.status}`;
      return "요청";
    }

    const { level, reason } = item;

    if (level === "warning") {
      // (선택) 유지 재알림이면 배지에 표시하고 싶으면 아래처럼
      // if (reason === "still_warning") return "경고·지속";
      return "경고";
    }
    if (level === "caution") {
      // if (reason === "still_caution") return "주의·지속";
      return "주의";
    }
    if (level === "normal") {
      if (
        reason === "caution_cleared" ||
        reason === "back_to_normal_from_caution" ||
        reason === "back_to_normal_from_warning"
      ) {
        return "해제";
      }
      return "정상";
    }
    return "";
  };

  return (
    <div className="w-full h-[180px] border border-gray-200 rounded-[10px] bg-white px-4 py-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">{floor} 문제 / 요청 내역</h2>
        {loading && (
          <span className="text-xs text-gray-400">불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[130px] overflow-y-auto text-xs">
        {!loading && items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            표시할 문제가 없습니다.
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-2 py-1 rounded-[6px] bg-[#F5F7F9]"
              >
                {/* 레벨/요청 뱃지 */}
                <div
                  className={`${levelColor(
                    item
                  )} text-white text-[10px] px-2 py-[2px] rounded-full whitespace-nowrap`}
                >
                  {levelText(item)}
                </div>

                {/* 메트릭 / 시간 / 설명 */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {METRIC_LABEL[item.metric] || item.metric || "기타"}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {item.kind === "request"
                        ? formatRequestTime(item.createdAt)
                        : formatTime(item.createdAt)}
                    </span>
                  </div>

                  {item.kind === "request" ? (
                    <div className="text-[10px] text-gray-600 truncate">
                      {item.title || item.content || "요청 내용이 없습니다."}
                    </div>
                  ) : (
                    item.reason && (
                      <div className="text-[10px] text-gray-600 truncate">
                        {getReasonText(item.reason, item.metric)}
                      </div>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
