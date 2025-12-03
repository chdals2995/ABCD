import { useEffect, useState } from "react";
import userIcon from "../../icons/login_icon.png"; // 경로 맞춰

export default function AlarmDropDownRequest({ message, floor }) {
  const [active, setActive] = useState(false);

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
      {/* 왼쪽 아이콘 + 층/호수 */}
      <div className="flex flex-col items-center justify-center w-[50px]">
        <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center ">
          <img src={userIcon} className="w-10 h-10" />
        </div>

        {/* ✔ 층/호수 아이콘 아래로 */}
        <span className=" text-[14px] text-gray-600 mt-1 whitespace-nowrap">
          {floor || "2층 201호"}
        </span>
      </div>

      {/* 오른쪽 텍스트 */}
      <div className="flex flex-col flex-1">
        <span className="text-[17px] font-medium text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis ml-5">
          {message || "공동구역에 쓰레기가 쌓였어요"}
        </span>
      </div>
    </div>
  );
}
