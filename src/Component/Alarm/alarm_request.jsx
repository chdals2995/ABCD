import { useState } from "react";

export default function AlarmRequest({ items = [] }) {
  const [sortOrder, setSortOrder] = useState("latest");

  const sortedList = [...items].sort((a, b) =>
    sortOrder === "latest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  );

  return (
    <div className="w-[335px] h-[698px] pt-[20px] px-[15px] bg-white">

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

      {/* 요청 리스트 */}
      {sortedList.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1 pb-[20px]">

          <span className="text-[16px] font-medium">
            [{item.level}] {item.metric} 감지
          </span>

          <span className="text-[14px] text-gray-600">
            {item.reason}
          </span>

          <span className="text-[12px] text-gray-400">
            {item.floor} · {new Date(item.createdAt).toLocaleString()}
          </span>

        </div>
      ))}
    </div>
  );
}
