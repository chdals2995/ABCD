import { useEffect, useState } from "react";
import urgentIcon from "../../icons/Alert_triangle_red_wihte.png";

/*
  AlarmDropDownUrgent
  - "위험(긴급)" 단계 알림이 발생했을 때 3초간 화면 상단에 표시되는 드롭다운
  - 기존 title, sub 방식 제거하고 alert 객체 기반으로 통일
  - alert 예시 구조:
      {
        id,
        floor,
        level,   // "문제" 또는 "긴급" 등
        metric,  // "전력" 등
        reason,  // 세부 설명
        createdAt
      }
*/
export default function AlarmDropDownUrgent({ alert }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // 컴포넌트 등장 애니메이션을 자연스럽게 하기 위해 약간의 지연 후 active = true
    setTimeout(() => setActive(true), 10);

    // 3초 뒤 자동으로 사라지도록 active = false
    const timer = setTimeout(() => setActive(false), 3000);

    // 언마운트 시 타이머 제거
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2
        w-[404px] h-[117px]
        bg-white
        border border-[#ff0000]
        rounded-md
        flex items-center
        shadow-[0px_4px_4px_rgba(255,0,0,0.25)]
        transition-all duration-300 ease-out z-[9999]
        urgent-pulse
        ${active ? "top-6" : "-top-32"}
      `}
    >

      {/* 왼쪽 아이콘 + "위험합니다!" 텍스트 + 층 정보 */}
      <div className="flex flex-col items-center justifty-center w-[120px]">
        <img src={urgentIcon} className="w-10 h-10 mb-1" />

      

        {/* 기존엔 없었지만, 다른 드롭다운과 일관성을 위해 floor 정보 추가 가능 */}
        <span className="text-[13px] text-gray-600 mt-1 whitespace-nowrap">
          {alert?.floor || ""}
        </span>
      </div>

      {/* 오른쪽 영역: 제목 + reason */}
      <div className="flex flex-col flex-1 pl-3">

        {/* 예: [문제] 전력 이상 감지 */}
        <span className="text-[20px font-bold text-[#000] truncate">
          [{alert?.level}] {alert?.metric} 이상 감지
        </span>

        {/* 세부 reason 설명 */}
        <span className="text-[16px] text-gray-600 mt-1">
          {alert?.reason || ""}
        </span>
      </div>
    </div>
  );
}
