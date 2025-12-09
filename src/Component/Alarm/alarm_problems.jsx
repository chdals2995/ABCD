import { useState } from "react";

export default function AlarmProblems({ items = [] }) {
  const [sortOrder, setSortOrder] = useState("latest");

  const sorted = [...items].sort((a, b) =>
    sortOrder === "latest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  );

  return (
    <div className="w-[335px] h-[698px] px-[15px] bg-white pt-[20px]">

      {/* 정렬 */}
      <div className="flex justify-end mb-[20px] gap-[10px] text-[14px]">
        <button
          onClick={() => setSortOrder("latest")}
          className={`${sortOrder === "latest" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          최신순
        </button>

        <span className="text-gray-400">|</span>

        <button
          onClick={() => setSortOrder("old")}
          className={`${sortOrder === "old" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          오래된순
        </button>
      </div>

      {/* 리스트 */}
      {sorted.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1 pb-[18px]">

          <div className="flex items-center gap-2">

             {/* 신규 알림일 때만 빨간 점 표시 */}
              {item.shouldBlink && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#FF0004] blink-dot"
                ></span>
              )}


            <span className="text-[16px] font-medium">
              [{item.level}] {item.metric}
            </span>
          </div>

          <span className="text-[14px] text-gray-600 ml-[14px]">
            {item.reason}
          </span>

          <span className="text-[12px] text-gray-400 ml-[14px]">
            {item.floor} · {new Date(item.createdAt).toLocaleString()}
          </span>

        </div>
      ))}

    </div>
  );
}
