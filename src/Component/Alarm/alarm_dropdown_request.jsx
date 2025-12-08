import { useEffect, useState } from "react";
import userIcon from "../../icons/login_icon.png"; 
import warningIcon from "../../icons/Alert_triangle_48.png";
import dangerIcon from "../../icons/Alert_triangle_red_wihte.png";; 
// 아이콘 파일은 네 프로젝트에 맞게 조정해

export default function AlarmDropDownRequest({ alert }) {
  const [active, setActive] = useState(false);

  // metric 변환
  const metricMap = {
    water: "수도",
    power: "전력",
    gas: "가스",
    temp: "온도",
  };

  // level 변환
  const levelMap = {
    warning: { text: "경고", icon: warningIcon },
    danger: { text: "문제", icon: dangerIcon },
    normal: { text: "정상", icon: userIcon },
  };

  // reason 변환 (임시)
  const reasonMap = {
    strong_overload_from_caution: "과부하 가능성이 감지되었습니다.",
  };

  const metricText = metricMap[alert?.metric] || "알 수 없음";
  const levelText = levelMap[alert?.level]?.text || "알림";
  const iconImg = levelMap[alert?.level]?.icon || userIcon;
  const reasonText = reasonMap[alert?.reason] || alert?.reason || "";

  // 팝업 애니메이션
  useEffect(() => {
    setTimeout(() => setActive(true), 10);
    const timer = setTimeout(() => setActive(false), 2500);
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
        ${active ? "top-6" : "-top-32"}
        notify-glow
      `}
    >
      {/* 왼쪽 아이콘 + 층 정보 */}
      <div className="flex flex-col items-center justify-center w-[50px]">
        <img src={iconImg} className="w-[40px] h-[40px]" />
        <span className="text-[14px] text-gray-600 mt-1 whitespace-nowrap">
          {alert?.floor || "층 정보 없음"}
        </span>
      </div>

      {/* 오른쪽 텍스트 */}
      <div className="flex flex-col flex-1">
        <span className="text-[17px] font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
          [{levelText}] {metricText} 이상 감지
        </span>

        <span className="text-[14px] text-gray-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {reasonText}
        </span>
      </div>
    </div>
  );
}
