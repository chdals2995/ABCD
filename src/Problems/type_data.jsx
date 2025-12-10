import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function TypeData({ data, selectedMetric }) {
  const colors = {
    전력: "#4A90E2",
    온도: "#FF6B6B",
    수도: "#4CD2C7",
    가스: "#FFA726",
  };

  // 데이터 필터링
  const filteredData = {
    전력: selectedMetric === "전력" ? data.전력 : 0,
    온도: selectedMetric === "온도" ? data.온도 : 0,
    수도: selectedMetric === "수도" ? data.수도 : 0,
    가스: selectedMetric === "가스" ? data.가스 : 0,
  };

  const chartData = {
    labels: Object.keys(filteredData),
    datasets: [
      {
        data: Object.values(filteredData),
        backgroundColor: Object.keys(filteredData).map((key) => colors[key]),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="w-full flex flex-col items-center mt-6 select-none">
      {/* ============================
          파이 차트
      ============================ */}
      <div className="w-[360px] h-[360px] mt-12">
        <Pie data={chartData} />
      </div>
    </div>
  );
}
