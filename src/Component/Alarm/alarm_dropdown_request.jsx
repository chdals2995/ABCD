import { useEffect, useState } from "react";
import userIcon from "../../icons/login_icon.png";
import warningIcon from "../../icons/Alert_triangle_48.png";
import dangerIcon from "../../icons/Alert_triangle_red_wihte.png";

/*
  AlarmDropDownRequest
  - 경고/문제 알림이 발생했을 때 상단에 3초 동안 표시되는 드롭다운 알림
  - 부모(Alarm.jsx)에서 전달받는 alert 객체는 이미 변환된 데이터임.
    예: { id, floor, level, metric, reason, createdAt }
*/
export default function AlarmDropDownRequest({ alert }) {
  // 드롭다운 등장 애니메이션 상태
  const [active, setActive] = useState(false);

  /*
    level(한글 기준)에 따라 아이콘 선택
    - Alarm.jsx에서 이미 level 변환이 끝나 있기 때문에 
      "경고" / "문제" / "주의" / "정상" 형태로 들어옴.
  */
  const iconMap = {
    경고: warningIcon,
    문제: dangerIcon,
    정상: userIcon,
    주의: warningIcon, // 필요하면 나중에 아이콘 변경 가능
  };

  const iconImg = iconMap[alert?.level] || userIcon;

  /*
    컴포넌트가 mount되면:
    1) 0.01초 후 active = true → 아래에서 위로 올라오는 애니메이션
    2) 2.5초 뒤 active = false → 다시 위로 사라짐
  */
  useEffect(() => {
    setTimeout(() => setActive(true), 10);

    const timer = setTimeout(() => setActive(false), 3000);

    // 컴포넌트 unmount될 때 타이머 제거
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2
        w-[404px] h-[117px]
        bg-white shadow-md rounded-lg
        flex items-center px-6 gap-4
        transition-all duration-300 ease-out z-[9999]
        ${active ? "top-6" : "-top-32"}   // active 상태에 따라 위치 변화
        notify-glow                       // 기존 CSS 효과 유지
      `}
    >
      {/* 왼쪽 아이콘 + 층 정보 */}
      <div className="flex flex-col items-center justify-center w-[50px]">
        <img src={iconImg} className="w-[40px] h-[40px]" />

        {/* alert.floor = 몇층인지 */}
        <span className="text-[14px] text-gray-600 mt-1 whitespace-nowrap">
          {alert?.floor || "층 없음"}
        </span>
      </div>

      {/* 오른쪽 텍스트 영역 */}
      <div className="flex flex-col flex-1">
        {/* 알림 제목: 예) [경고] 전력 이상 감지 */}
        <span className="text-[17px] font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
          [{alert?.level}] {alert?.metric} 이상 감지
        </span>

        {/* 알림 상세 이유: 예) 과부하 가능성이 감지되었습니다. */}
        <span className="text-[14px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {alert?.reason}
        </span>
      </div>
    </div>
  );
}
