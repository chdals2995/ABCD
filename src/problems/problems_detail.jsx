// 문제 상세 보기 모달
// ProblemsDetail.jsx

import React from "react";


export default function ProblemsDetail({ problem, onClose }) {
  if (!problem) return null; // 안전장치

  return (
    <div className="
      fixed inset-0 bg-black bg-opacity-40 
      flex justify-center items-center 
      z-[9999]
    ">
      {/* 모달 박스 */}
      <div className="w-[420px] bg-white rounded-md p-6 shadow-lg">

        {/* 제목 */}
        <h2 className="text-[22px] font-bold mb-4">
          문제 상세 정보
        </h2>

        {/* 문제 정보 */}
        <div className="flex flex-col gap-3 text-[16px]">

          <div>
            <span className="font-semibold">층: </span>
            {problem.floor}
          </div>

          <div>
            <span className="font-semibold">유형: </span>
            {problem.metric}
          </div>

          <div>
            <span className="font-semibold">내용: </span>
            {problem.reason}
          </div>

          <div>
            <span className="font-semibold">상태: </span>
            {problem.status === "unresolved" ? "미해결" : "해결됨"}
          </div>

          <div>
            <span className="font-semibold">발생 시간: </span>
            {new Date(problem.createdAt).toLocaleString("ko-KR")}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          className="
            mt-6 w-full py-2 
            bg-gray-700 text-white rounded-md 
            hover:bg-gray-900 transition
          "
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
