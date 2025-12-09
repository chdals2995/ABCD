// TypeData.jsx — 활성 탭에서만 필터 아이콘 표시 + 슬라이드 하이라이트
import React from "react";
import FilterIcon from "../icons/filter_icon.png";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function TypeData({ data, selectedMetric, onSelectMetric }) {
  const colors = {
    전력: "#4A90E2",
    온도: "#FF6B6B",
    수도: "#4CD2C7",
    가스: "#FFA726",
  };

  const filtered = {
    전력: selectedMetric === "전력" ? data.전력 : 0,
    온도: selectedMetric === "온도" ? data.온도 : 0,
    수도: selectedMetric === "수도" ? data.수도 : 0,
    가스: selectedMetric === "가스" ? data.가스 : 0,
  };

  const chartData = {
    labels: Object.keys(filtered),
    datasets: [
      {
        data: Object.values(filtered),
        backgroundColor: Object.keys(filtered).map((k) => colors[k]),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // 슬라이드 이동 좌표
  const slideX =
    selectedMetric === "전력"
      ? "0%"
      : selectedMetric === "온도"
      ? "100%"
      : selectedMetric === "수도"
      ? "200%"
      : "300%";

  return (
    <div className="w-full flex flex-col items-center mt-6 select-none">

      {/* ============================
            상단 탭 + 슬라이드 하이라이트
        ============================ */}
      <div className="relative w-full max-w-[950px] mx-auto">

        {/* 배경 하이라이트 */}
        <div
          className="
            absolute top-0 h-[65px]
            bg-white rounded-[20px] shadow-md
            transition-all duration-300
          "
          style={{
            width: "calc(100% / 4)",
            transform: `translateX(${slideX})`,
          }}
        />

        {/* 버튼 4개 */}
        <div className="flex relative z-10">
          {["전력", "온도", "수도", "가스"].map((type) => {
            const isActive = selectedMetric === type;

            return (
              <button
                key={type}
                onClick={() => onSelectMetric(type)}
                className={`
                  flex-1 flex justify-center items-center gap-2
                  text-[36px] font-bold py-2 rounded-[20px]
                  transition-all duration-200 cursor-pointer
                  ${isActive ? "text-[#054E76]" : "text-[#999999]"}
                `}
              >
                {type}

                {/* 활성화된 탭에서만 아이콘 표시 */}
                {isActive && (
                  <img
                    src={FilterIcon}
                    className="w-[28px] h-[28px] ml-2"
                    alt="filter-icon"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================
          파이 차트
      ============================ */}
      <div className="w-[360px] h-[360px] mt-12">
        <Pie data={chartData} />
      </div>

      <p className="text-center text-gray-500 text-[14px] mt-4">
        유형을 선택하면 차트와 데이터가 필터링됩니다.
      </p>
    </div>
  );
}
