import { useEffect, useState, useMemo } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../firebase/config";
import { useNavigate } from "react-router-dom";

// toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 아이콘
import warningIcon from "../assets/icons/iconRed.png";
import cautionIcon from "../assets/icons/alert.png";

// 컴포넌트
import UnsolvedList from "../problems/unsolved_list";
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
   시간 포맷
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
   reason → 한글 문장
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
   토스트
========================= */
function showDetailToast(item) {
  const icon = item.level === "warning" ? warningIcon : cautionIcon;

  toast(
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <img src={icon} className="w-[18px] h-[18px]" />
          <span className="text-[18px] font-bold">
            {item.level === "warning" ? "경고" : "주의"}
          </span>
        </div>
        <span className="text-[13px] text-gray-500">
          {formatTime(item.createdAt)}
        </span>
      </div>

      <div className="text-[16px] font-semibold">
        {getReasonText(item.reason, item.metric, item.level)}
      </div>

      <div className="text-[13px] text-gray-600">
        {item.floor} · {item.dateKey}
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: item.level === "warning" ? 3500 : 2500,
      hideProgressBar: true,
    }
  );
}

export default function AlarmProblems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  /* =========================
     alerts 읽기
  ========================= */
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

  /* =========================
     🔥 미해결 리스트용
  ========================= */
  const unsolvedItems = useMemo(() => {
    return items.map((item) => ({
      id: item.id,
      metric: METRIC_NORMALIZE[item.metric] || item.metric,
      floor: item.floor,
      createdAt: item.createdAt,
      reason: getReasonText(item.reason, item.metric, item.level),
    }));
  }, [items]);

  const handleRead = (item) => {
    update(ref(rtdb, `alerts/${item.floor}/${item.dateKey}/${item.id}`), {
      check: true,
    });
    showDetailToast(item);
  };

  return (
    <>
      <ToastContainer newestOnTop pauseOnHover={false} />

      <div className="flex gap-6">
        {/* ===== 알람 패널 ===== */}
        <div className="w-[335px] h-[698px] bg-white px-[15px] py-[10px]
        mt-5 ">
          <div className="text-[17px] text-gray-400 mb-7 mt-1">
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

        {/* ===== 미해결 항목 (문제 페이지로 이동) ===== */}
        <UnsolvedList
          items={unsolvedItems}
          onSelectProblem={(id) => {
            navigate("/problems", {
              state: {
                from: "alarm",
                problemId: id,
              },
            });
          }}
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
      <div className="flex items-center gap-2 mb-5">
        <img src={icon} className="w-[18px] h-[18px]" />
        <span className="text-[20px] font-semibold">{title}</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto hide-scrollbar">
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
              flex justify-between
              border-b py-3 mb-3 
              cursor-pointer"
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
