import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../firebase/config";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 아이콘
import warningIcon from "../assets/icons/iconRed.png"; // 경고
import cautionIcon from "../assets/icons/alert.png";   // 주의

/* =========================
   metric 정규화
========================= */
const METRIC_NORMALIZE = {
  elec: "전력",
  electric: "전력",
  power: "전력",
  전력: "전력",

  water: "수도",
  수도: "수도",

  gas: "가스",
  가스: "가스",

  temp: "온도",
  temperature: "온도",
  온도: "온도",
};

/* =========================
   reason → 한글 (level 기준 정리)
   기준:
   - warning = 정상 범위 초과
   - caution = 이상 상태 감지
========================= */
function getReasonText(reason, metric, level) {
  const m = METRIC_NORMALIZE[metric] || metric || "";

  const map = {
    // 경고 (초과)
    sustained_warning_from_normal: "정상 범위를 초과한 상태가 지속되고 있습니다.",
    normal_to_warning: "정상 상태에서 경고 단계로 전환되었습니다.",
    caution_to_warning: "주의 단계에서 경고 단계로 전환되었습니다.",
    still_warning: "경고 상태가 다음날까지 지속되고 있습니다.",
    over_threshold: "임계치를 초과했습니다.",

    // 주의 (이상 감지)
    sustained_caution_from_normal: "이상 상태가 지속되고 있습니다.",
    normal_to_caution: "정상 상태에서 주의 단계로 전환되었습니다.",
    still_caution: "주의 상태가 다음날까지 지속되고 있습니다.",
    spike_detected: "이상 상태가 감지되었습니다.",

    // 해제
    caution_cleared: "주의 상태가 해제되었습니다.",
    warning_cleared: "경고 상태가 해제되었습니다.",
    recovered_to_normal: "정상 상태로 복귀했습니다.",
  };

  if (map[reason]) {
    return `${m} ${map[reason]}`;
  }

  // ✅ fallback (여기가 핵심)
  if (level === "warning") {
    return `${m} 정상 범위 초과 상태가 감지되었습니다.`;
  }

  if (level === "caution") {
    return `${m} 이상 상태가 감지되었습니다.`;
  }

  return `${m} 상태 변화가 감지되었습니다.`;
}

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
            if (v.level === "normal") return;
            if (v.level === "completed" || v.status === "done") return;
            if (v.check === true) return; // 안 읽은 것만

            list.push({
              id,
              floor,
              dateKey,
              level: v.level, // warning | caution
              metric: v.metric,
              reason: v.reason,
              createdAt: Number(v.createdAt) || 0,
            });
          });
        });
      });

      list.sort((a, b) => b.createdAt - a.createdAt);
      setItems(list);
    });
  }, []);

  const warningItems = items.filter((i) => i.level === "warning");
  const cautionItems = items.filter((i) => i.level === "caution");

  /* =========================
     읽음 처리 + 토스트
========================= */
  const handleRead = (item) => {
    update(
      ref(rtdb, `alerts/${item.floor}/${item.dateKey}/${item.id}`),
      { check: true }
    );

    toast.success("알림을 읽었습니다", {
      autoClose: 1000,
      position: "top-center",
    });
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        newestOnTop
        style={{ zIndex: 99999 }}
      />

      <div className="w-[335px] h-[698px] bg-white px-[15px] py-[10px]">
        <div className="text-[12px] text-gray-400 mb-5 mt-3">
          최신 문제 알림 (새로 발생한 항목)
        </div>

        {/* 경고 */}
        <Section
          title="경고"
          icon={warningIcon}
          items={warningItems}
          onRead={handleRead}
        />

        {/* 주의 */}
        <Section
          title="주의"
          icon={cautionIcon}
          items={cautionItems}
          onRead={handleRead}
        />
      </div>
    </>
  );
}

/* =========================
   섹션 컴포넌트
========================= */
function Section({ title, icon, items, onRead }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <img src={icon} className="w-[18px] h-[18px]" />
        <span className="text-[20px] font-semibold">{title}</span>
      </div>

      <div className="max-h-[260px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-gray-400 text-[14px] py-2">
            항목 없음
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onRead(item)}
              className="
                flex justify-between border-b py-2 mb-3
                cursor-pointer border-[#e5e5e5]
              "
            >
              <span className="text-[15px] w-[180px] truncate">
                {getReasonText(item.reason, item.metric, item.level)}
              </span>

              <span className="text-[13px] text-[#555] whitespace-nowrap">
                {item.floor} / {item.dateKey}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
