import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../firebase/config";

import cautionIcon from "../assets/icons/iconRed.png";
import warningIcon from "../assets/icons/alert.png";

/* =========================
   Metric 한글 매핑
========================= */
const METRIC_KO = {
  water: "수도",
  gas: "가스",
  power: "전력",
  temperature: "온도",
  temp: "온도",
};

/* =========================
   Reason 한글 매핑
========================= */
const REASON_KO = {
  sustained_caution_from_normal: "정상 범위 이탈(주의 지속)",
  sustained_warning_from_normal: "정상 범위 이탈(경고 지속)",
  spike_detected: "급격한 변화 감지",
  over_threshold: "임계치 초과",

  normal_to_caution: "정상 → 주의 전환",
  normal_to_warning: "정상 → 경고 전환",
  caution_to_warning: "주의 → 경고 전환",

  caution_cleared: "주의 해제",
  warning_cleared: "경고 해제",
  recovered_to_normal: "정상 상태 복귀",
};

export default function AlarmProblems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        return;
      }

      const list = [];

      Object.entries(data).forEach(([floor, dates]) => {
        Object.entries(dates || {}).forEach(([dateKey, alerts]) => {
          Object.entries(alerts || {}).forEach(([id, v]) => {
            // 정상 / 완료 상태 제외
            if (v.level === "normal") return;
            if (v.level === "completed" || v.status === "done") return;

            list.push({
              id,
              floor,
              dateKey, // 경로 기준 날짜
              level: v.level, // warning | caution
              metric: v.metric,
              reason: v.reason,
              value: v.value,
              createdAt: Number(v.createdAt) || 0,

              // ⭐ check 기준 (기존 checked 데이터 호환)
              check:
                v.check !== undefined
                  ? v.check
                  : v.checked !== false,
            });
          });
        });
      });

      // 최신순
      list.sort((a, b) => b.createdAt - a.createdAt);
      setItems(list);
    });
  }, []);

  /* =========================
     경고 / 주의 분리 (각 5개)
========================= */
  const warningList = items
    .filter((x) => x.level === "warning")
    .slice(0, 5);

  const cautionList = items
    .filter((x) => x.level === "caution")
    .slice(0, 5);

  /* =========================
     읽음 처리 (check → false)
========================= */
  const handleRead = (item) => {
    if (!item.floor || !item.dateKey || !item.id) return;

    update(
      ref(rtdb, `alerts/${item.floor}/${item.dateKey}/${item.id}`),
      { check: false }
    );
  };

  const sections = [
    { title: "경고", icon: warningIcon, data: warningList },
    { title: "주의", icon: cautionIcon, data: cautionList },
  ];

  return (
    <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px]">
      {/* 상단 안내 */}
      <div className="text-[12px] text-gray-400 mb-5 mt-3">
        최신 문제 알림 (읽지 않은 항목 기준)
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="mb-6">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-2 mb-4">
            <img src={sec.icon} className="w-[18px] h-[18px]" />
            <span className="text-[20px] font-semibold">
              {sec.title}
            </span>
          </div>

          {/* 비어있을 때 */}
          {sec.data.length === 0 && (
            <div className="text-gray-400 text-[14px] py-2">
              항목 없음
            </div>
          )}

          {/* 리스트 */}
          {sec.data.map((item) => (
            <div
              key={item.id}
              onClick={() => handleRead(item)}
              className={`
                flex justify-between border-b py-2 mb-4 cursor-pointer
                ${item.check ? "border-[#e5e5e5]" : "opacity-40"}
              `}
            >
              <span className="text-[16px] w-[180px] truncate">
                {METRIC_KO[item.metric] ?? "알 수 없음"}
                {" · "}
                {REASON_KO[item.reason] ?? "이상 상태 감지"}
              </span>

              {/* 층 / 날짜 */}
              <span className="text-[13px] text-[#555] whitespace-nowrap">
                {item.floor} / {item.dateKey}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
