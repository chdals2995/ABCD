import { useEffect, useState } from "react";
import urgentIcon from "../../icons/Alert_triangle_red_wihte.png";

export default function AlarmDropDownUrgent({ title, sub }) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        setTimeout(() => setActive(true), 10);
        const timer = setTimeout(() => setActive(false), 3000);
        return () => clearTimeout(timer);
    },[]);

    return(
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

        {/* 왼쪽 아이콘 + 텍스트 */}
        <div className="flex flex-col items-center justifty-center w-[120px]">
            <img src={urgentIcon} className="w-10 h-10 mb-1" />
            <span
             className="text-[16px] font=bold"
             style={{color:"#ff5e5e",}}>
             위험합니다!
             </span>
        </div>

        {/* 오른쪽 제목 */}
        <div className="flex flex-col flex-1 pl-3">
            <span className="text-[20px font-bold text-[#000] truncate">
                {title || "긴급 제목"}
            </span>
            <span className="text-[16px] text-gray-600 mt-1">
                {sub || ""}
            </span>
        </div>
     </div>
    );
}