// src/components/floors/ProblemList.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const METRIC_LABEL = {
  elec: "전기",
  water: "수도",
  gas: "가스",
  temp: "온도",
};

/**
 * RTDB에 저장된 reason 코드 → 한글 설명
 * 필요하면 여기 케이스를 계속 추가하면 됨
 */
function getReasonText(reason, metric) {
  if (!reason) return "";

  const metricLabel = METRIC_LABEL[metric] || "";

  switch (reason) {
    case "strong_overload_from_normal":
      // 예: 전기 사용량이 한계를 훨씬 넘었을 때
      return `${metricLabel} 사용량이 기준 대비 심하게 과다합니다.`;

    case "overload_from_normal":
      // 예: 기준치를 초과했을 때
      return `${metricLabel} 사용량이 기준치를 초과했습니다.`;

    case "sustained_caution_from_normal":
      // 예: caution 상태가 오래 지속
      return `${metricLabel} 주의 상태가 일정 시간 이상 지속되었습니다.`;

    case "sustained_warning_from_normal":
      // 예: warning 상태가 오래 지속
      return `${metricLabel} 경고 상태가 일정 시간 이상 지속되었습니다.`;

    case "back_to_normal_from_caution":
      return `${metricLabel}가(이) 주의 상태에서 정상으로 복귀했습니다.`;

    case "back_to_normal_from_warning":
      return `${metricLabel}가(이) 경고 상태에서 정상으로 복귀했습니다.`;

    default:
      // 아직 매핑 안 한 새로운 코드가 들어왔을 때
      return "이상 상태가 감지되었습니다.";
  }
}

export default function ProblemList({ floor }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!floor) {
      setItems([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const todayKey = formatDateKey(new Date());
    const alertsRef = ref(rtdb, `alerts/${floor}/${todayKey}`);

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
              createdAt: val.createdAt,
              level: val.level,
              metric: val.metric,
              reason: val.reason,
              value: val.value,
            });
          });
        }

        // 최신 순 정렬
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("ProblemList onValue error:", err);
        if (!isMounted) return;
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [floor]);

  const levelColor = (level) => {
    if (level === "warning") return "bg-[#FF7070]";
    if (level === "caution") return "bg-[#FFD85E]";
    return "bg-[#88C5F7]";
  };

  const levelText = (level) => {
    if (level === "warning") return "경고";
    if (level === "caution") return "주의";
    return "요청";
  };

  return (
    <div className="w-full h-[180px] border border-gray-200 rounded-[10px] bg-white px-4 py-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">{floor} 문제 내역 (오늘)</h2>
        {loading && (
          <span className="text-xs text-gray-400">불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[130px] overflow-y-auto text-xs">
        {!loading && items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            오늘 발생한 문제가 없습니다.
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-2 py-1 rounded-[6px] bg-[#F5F7F9]"
              >
                {/* 레벨 뱃지 */}
                <div
                  className={`${levelColor(
                    item.level
                  )} text-white text-[10px] px-2 py-[2px] rounded-full whitespace-nowrap`}
                >
                  {levelText(item.level)}
                </div>

                {/* 메트릭 / 시간 / 이유 */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {METRIC_LABEL[item.metric] || item.metric || "기타"}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  {item.reason && (
                    <div className="text-[10px] text-gray-600 truncate">
                      {getReasonText(item.reason, item.metric)}
                    </div>
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
