// 미해결 문제 리스트
// UnsolvedList.jsx

import React from "react";


export default function UnsolvedList({ items, onSelectProblem }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        미해결 문제가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <h2 className="text-[22px] font-bold mb-4">미해결 문제</h2>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-full border border-gray-200 p-4 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition"
            onClick={() => onSelectProblem(item.id)}
          >
            {/* 상단: 층 + 문제유형 */}
            <div className="flex justify-between">
              <span className="text-[18px] font-bold">{item.floor}</span>
              <span className="text-[16px] font-semibold text-blue-600">
                {item.metric}
              </span>
            </div>

            {/* 이유(문제 내용) */}
            <div className="text-[15px] text-gray-700 mt-1">
              {item.reason}
            </div>

            {/* 발생 시간 */}
            <div className="text-[13px] text-gray-500 mt-2">
              {new Date(item.createdAt).toLocaleString("ko-KR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
