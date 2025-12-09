// 전체 문제 로그(Resolved + Unresolved)
// ProblemsLog.jsx

import React from "react";


export default function ProblemsLog({ items, onSelectProblem }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        기록된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full mt-12">
      {/* 타이틀 */}
      <h2 className="text-[22px] font-bold mb-4">전체 문제 로그</h2>

      {/* 로그 리스트 */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const isUnresolved = item.status === "unresolved";

          return (
            <div
              key={item.id}
              className={`
                w-full border p-4 rounded-md bg-white cursor-pointer
                hover:bg-gray-50 transition 
                ${isUnresolved ? "border-red-400" : "border-gray-200"}
              `}
              onClick={() => onSelectProblem(item.id)}
            >
              {/* 상단: 층 + 유형 */}
              <div className="flex justify-between items-center">
                <span className="text-[18px] font-bold">{item.floor}</span>

                <span
                  className={`text-[16px] font-semibold ${
                    isUnresolved ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {item.metric}
                </span>
              </div>

              {/* 문제 내용 */}
              <div className="text-[15px] text-gray-700 mt-1">
                {item.reason}
              </div>

              {/* 상태 표시 */}
              <div className="text-[13px] mt-1">
                <span
                  className={`px-2 py-0.5 rounded-md text-white text-[12px]
                    ${isUnresolved ? "bg-red-500" : "bg-gray-400"}
                  `}
                >
                  {isUnresolved ? "미해결" : "해결됨"}
                </span>
              </div>

              {/* 날짜 */}
              <div className="text-[13px] text-gray-500 mt-2">
                {new Date(item.createdAt).toLocaleString("ko-KR")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
