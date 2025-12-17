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

// 층 문자열을 통일된 키로 변환 ("8F", "8층", "지하 2층", "B2" 등 → "8F" / "B2")
function normalizeFloor(value) {
  if (!value) return null;
  const s = String(value).trim();

  // B2, B10 같은 형식
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

  // 나머지: 숫자만 있거나 "8F", "8층" 같은 것들 → 지상층
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = m[1];
  return `${n}F`;
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
    requests: 0, // 🔹 해당 층 (완료 제외) 요청 개수
  });

  const normalizedSelfFloor = normalizeFloor(floor);

  // 🔹 alerts (경고/주의) 구독
  useEffect(() => {
    if (!normalizedSelfFloor) return;

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

      setCounts((prev) => ({
        ...prev,
        warning,
        caution,
      }));
    });

    return () => unsubscribe();
  }, [floor, normalizedSelfFloor]);

  // 🔹 requests에서 이 층의 요청 개수 세기 (완료 제외)
  useEffect(() => {
    if (!normalizedSelfFloor) return;

    const requestsRef = ref(rtdb, "requests");

    const unsubscribe = onValue(requestsRef, (snapshot) => {
      let reqCount = 0;

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          const reqFloorNorm = normalizeFloor(val?.floor);

          // 층이 같고, status !== "완료" 인 것만 카운트
          if (
            reqFloorNorm &&
            reqFloorNorm === normalizedSelfFloor &&
            val?.status !== "완료"
          ) {
            reqCount += 1;
          }
        });
      }

      setCounts((prev) => ({
        ...prev,
        requests: reqCount,
      }));
    });

    return () => unsubscribe();
  }, [normalizedSelfFloor]);

  const Badge = ({ icon, value, alt, sizeClass }) => {
    if (!value) return null; // 0이면 아이콘 숨김
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
      className={`relative w-full h-full text-left cursor-pointer ${
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
        {/* 🔹 circle 아이콘: 해당 층 요청 개수 (완료 제외) */}
        <Badge
          icon={circleIcon}
          value={counts.requests}
          alt="요청 개수"
          sizeClass="w-[52px] h-[52px]"
        />
      </div>
    </button>
  );
}
