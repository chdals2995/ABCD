//경고  알림창

import { useEffect, useState} from "react";
import cautionIcon  from "../../icons/Alert_triangle_48.png"


export default function AlarmDropDownCaution({ title, sub}) {
    const [active, setActive] = useState (false);
      
    useEffect(() => {
        //살짝 딜레이 후 등장
        setTimeout(() => setActive(true), 10);

        //일정 시간 뒤 사라짐
        const timer = setTimeout(() => setActive(false), 3000);
        return() => clearTimeout(timer);
    },[]);

    return(
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
    ${active ? "top-6 caution-pulse" : "-top-32"}
  `}
    >
    {/* 왼쪽 아이콘 + 텍스트 */}
    <div className="flex flex-col items-center justify-center w-[120px]">
        <img src={cautionIcon} className="w-10 h-10 mb-1" />
        <span className="text-[16px] font-bold text-[#000] "
            style={{ WebkitTextStroke: "0.1px #FFDB3D"}}>
        주의하세요!
        </span>
    </div>

    {/* 오른쪽 제목 */}
    <div className="flex flex-col flex-1 pl-3">
        <span className="text-[20px] font-bold text-[#000] truncate">
        {title || "주의 제목"}
        </span>
        <span className="text-[15px] text-gray-600 mt-1">
        {sub || ""}
        </span>
    </div>
    </div>

    )
}