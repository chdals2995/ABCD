// src/components/floors/Floor.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

import cautionIcon from "../../assets/icons/caution.png";
import warningIcon from "../../assets/icons/warning.png";
import circleIcon from "../../assets/icons/circle.png";

// 오늘 날짜 -> "YYYY-MM-DD"
function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * props:
 *  - floor: "10F" / "9F" ...
 *  - selected: boolean (선택된 층인지)
 *  - onClick: () => void (층 클릭 시)
 */
export default function Floor({ floor, selected, onClick }) {
  const [counts, setCounts] = useState({
    warning: 0,
    caution: 0,
    total: 0,
  });

  useEffect(() => {
    if (!floor) return;

    const todayKey = formatDateKey(new Date());
    const floorRef = ref(rtdb, `alerts/${floor}/${todayKey}`);

    const unsubscribe = onValue(floorRef, (snapshot) => {
      let warning = 0;
      let caution = 0;

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          const level = val?.level;

          if (level === "warning") {
            warning += 1;
          } else if (level === "caution") {
            caution += 1;
          }
        });
      }

      setCounts({
        warning,
        caution,
        total: warning + caution,
      });
    });

    return () => unsubscribe();
  }, [floor]);

  const Badge = ({ icon, value, alt, sizeClass }) => {
    if (!value) return null; // 0이면 안 보여줌
    return (
      <div className={`relative ${sizeClass} flex items-center justify-center`}>
        <img
          src={icon}
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[18px] font-bold text-[#054E76] leading-none">
            {value}
          </span>
        </div>
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full h-full text-left ${
        selected ? "bg-[#6FA8D6]" : "bg-[#A3C2D7]"
      }`}
    >
      {/* 층 텍스트 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[60px] text-sm font-semibold text-[#054E76] ml-[18px]">
        {floor}
      </div>

      {/* 아이콘 3개 묶음: 중앙 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-[16px]">
        <Badge
          icon={warningIcon}
          value={counts.warning}
          alt="경고 개수"
          sizeClass="w-[51px] h-[58px]"
        />
        <Badge
          icon={cautionIcon}
          value={counts.caution}
          alt="주의 개수"
          sizeClass="w-[51px] h-[58px]"
        />
        {/* circle은 나중 다른 용도로 쓸 거라 지금은 0이면 아예 표시 안 함 */}
        <Badge
          icon={circleIcon}
          value={counts.total}
          alt="전체 알림 수"
          sizeClass="w-[52px] h-[52px]"
        />
      </div>
    </button>
  );
}
