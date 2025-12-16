import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../firebase/config";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 아이콘
import warningIcon from "../assets/icons/iconRed.png"; // 경고
import cautionIcon from "../assets/icons/alert.png";   // 주의

import "./hide_scrollbar.css";

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
   시간 포맷 (HH:MM:SS)
========================= */
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/* =========================
   reason → 한글
========================= */
function getReasonText(reason, metric, level) {
  const m = METRIC_NORMALIZE[metric] || metric || "";

  const map = {
    sustained_warning_from_normal: "정상 범위를 초과한 상태가 지속되고 있습니다.",
    normal_to_warning: "정상 상태에서 경고 단계로 전환되었습니다.",
    caution_to_warning: "주의 단계에서 경고 단계로 전환되었습니다.",
    still_warning: "경고 상태가 지속되고 있습니다.",
    over_threshold: "임계치를 초과했습니다.",

    sustained_caution_from_normal: "이상 상태가 지속되고 있습니다.",
    normal_to_caution: "정상 상태에서 주의 단계로 전환되었습니다.",
    still_caution: "주의 상태가 지속되고 있습니다.",
    spike_detected: "이상 상태가 감지되었습니다.",

    caution_cleared: "주의 상태가 해제되었습니다.",
    warning_cleared: "경고 상태가 해제되었습니다.",
    recovered_to_normal: "정상 상태로 복귀했습니다.",
  };

  if (map[reason]) return `${m} ${map[reason]}`;
  if (level === "warning") return `${m} 정상 범위 초과 상태가 감지되었습니다.`;
  if (level === "caution") return `${m} 이상 상태가 감지되었습니다.`;

  return `${m} 상태 변화가 감지되었습니다.`;
}

  /* =========================
    컴팩트 토스트
  ========================= */
  function showDetailToast(item) {
    const icon = item.level === "warning" ? warningIcon : cautionIcon;
    const message = getReasonText(item.reason, item.metric, item.level);
    const timeText = formatTime(item.createdAt);

    toast(
      <div className="flex flex-col gap-2">
        {/* 상단 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
          <img src={icon} className="w-[18px] h-[18px]" />
            <span className="text-[18px] font-bold text-gray-800">
          {item.level === "warning" ? "경고" : "주의"}
        </span>
      </div>

      <span className="text-[13px] text-gray-500 mt-[20px] whitespace-nowrap">
        {timeText}
      </span>
   </div>

      {/* 메시지 (2줄 제한) */}
      <div
        className="text-[16px] font-semibold text-gray-900 break-words overflow-hidden"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {message}
      </div>

      {/* 위치 */}
      <div className="text-[13px] text-gray-600">
        {item.floor} · {item.dateKey}
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: item.level === "warning" ? 3500 : 2500,
      closeOnClick: true,
      hideProgressBar: true,
    }
  );
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
            if (v.check === true) return;

            list.push({
              id,
              floor,
              dateKey,
              level: v.level,
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

  const handleRead = (item) => {
    update(
      ref(rtdb, `alerts/${item.floor}/${item.dateKey}/${item.id}`),
      { check: true }
    );
    showDetailToast(item);
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        newestOnTop
        pauseOnHover={false}
        style={{ zIndex: 99999 }}
        toastClassName={() =>
          "min-w-[360px] max-w-[420px] px-4 py-3 rounded-xl shadow-sm bg-white"
        }
        bodyClassName={() => "p-0 m-0"}
      />

      <div className="w-[335px] h-[698px] bg-white px-[15px] py-[10px]">
        <div className="text-[12px] text-gray-400 mb-5 mt-3">
          안 읽은 알림
        </div>

        <Section
          title="경고"
          icon={warningIcon}
          items={warningItems}
          onRead={handleRead}
        />

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
    섹션
  ========================= */
  function Section({ title, icon, items, onRead }) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <img src={icon} className="w-[18px] h-[18px]" />
          <span className="text-[20px] font-semibold">{title}</span>
        </div>

        <div className="max-h-[260px] overflow-y-auto hide-scrollbar">
          {items.length === 0 ? (
            <div className="text-gray-400 text-[14px] py-2">
              항목 없음
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => onRead(item)}
                className="flex justify-between border-b py-2 mb-3 cursor-pointer border-[#e5e5e5]"
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
