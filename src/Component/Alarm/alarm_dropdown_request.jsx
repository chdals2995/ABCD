import { useEffect, useState} from "react";

export default function AlarmDropDownRequest({ title, message, onClick}){
    const [active, setActive] = useState(false);

    useEffect(() => {
        //아래로 떨어지는 애니메이션 시작
        setTimeout(() => setActive(true), 10);

        // 자동 닫힘
        const timer = setTimeout(() => setActive(false), 2500);
        return () => clearTimeout(timer);
    }, []);


    return(
        <div className={`
            fixed left-1/2 -translate-x-1/2
            w-[90%] max-w-[480px] h-[60px]
            flex items-center gap-3 px-4
            bg-white shadow-lg rounded-md
            transition-all duration-300 ease-out
            ${active ? "top-5" : "-top-20"}
        `}>
        onClick={onClick}
            <span className="text-white bg-blue-500 text-xs px-2 py-[3px] rounded-[4px] whitespace-nowrap">
                {title || "요청 알림"}
            </span>

            <span className="text-[14px] text gray-700 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {message || "새로운 요청이 도착했습니다."}
            </span>
        </div>3
}