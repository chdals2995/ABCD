import { useEffect, useState } from "react";
import cautionIcon from "../../icons/Alert_triangle_48.png";

/*
  AlarmDropDownCaution
  - "주의" 단계 알림 드롭다운
  - urgent 레이아웃과 100% 동일한 구조
  - 차이점: 아이콘, 색상, border 컬러만 caution 스타일로 유지
*/
export default function AlarmDropDownCaution({ alert }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setActive(true), 10);
    const timer = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2
        w-[404px] h-[117px]
        bg-white
        border border-[#FFDB3D]
        rounded-md
        flex items-center
        shadow-[0px_4px_4px_rgba(255,215,0,0.25)]
        transition-all duration-300 ease-out z-[9999]
        caution-pulse
        ${active ? "top-6" : "-top-32"}
      `}
    >

      {/* 왼쪽 아이콘 + 층 */}
      <div className="flex flex-col items-center justify-center w-[120px]">
        <img src={cautionIcon} className="w-10 h-10 mb-1" />

        <span className="text-[13px] text-gray-600 mt-1 whitespace-nowrap">
          {alert?.floor || ""}
        </span>
      </div>

      {/* 오른쪽: 제목 + reason */}
      <div className="flex flex-col flex-1 pl-3">

        {/* 예: [주의] 수도 이상 감지 */}
        <span className="text-[20px font-bold text-[#000] truncate">
          [{alert?.level}] {alert?.metric} 이상 감지
        </span>

        {/* 상세 내용 */}
        <span className="text-[15px] text-gray-600 mt-1">
          {alert?.reason || ""}
        </span>
      </div>
    </div>
  );
}
