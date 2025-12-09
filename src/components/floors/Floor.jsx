// src/components/floors/Floor.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

import cautionIcon from "../../assets/icons/caution.png";
import warningIcon from "../../assets/icons/warning.png";
// circleIcon은 일단 사용 안 함
// import circleIcon from "../../assets/icons/circle.png";

// 오늘 날짜 -> "YYYY-MM-DD"
function formatDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * props:
 *  - floor: "10F" / "9F" ... 이런 층 ID
 */
export default function Floor({ floor }) {
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

  // 경고/주의 배지: 값이 0이면 렌더 안 함
  const CountBadge = ({ icon, value, alt, sizeClass }) => {
    if (!value || value <= 0) return null;

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
    // 이 컴포넌트는 부모가 h-[63px]로 감싸고 있다고 가정
    <div className="relative w-full h-full bg-[#A3C2D7]">
      {/* 층 텍스트 (왼쪽 고정) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[60px] text-sm font-semibold text-[#054E76] ml-[18px]">
        {floor}
      </div>

      {/* 아이콘 묶음: 줄 기준 중앙 정렬 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-[16px]">
        {/* 🔺 경고 (0이면 안 나옴) */}
        <CountBadge
          icon={warningIcon}
          value={counts.warning}
          alt="경고 개수"
          sizeClass="w-[51px] h-[58px]"
        />

        {/* 🔶 주의 (0이면 안 나옴) */}
        <CountBadge
          icon={cautionIcon}
          value={counts.caution}
          alt="주의 개수"
          sizeClass="w-[51px] h-[58px]"
        />

        {/* ⚪ circle은 지금은 숨김 (나중에 값 생기면 여기 추가) */}
      </div>
    </div>
  );
}
