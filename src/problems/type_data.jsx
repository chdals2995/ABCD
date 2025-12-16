import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export default function TypeData({ data, selectedMetric }) {
  const colors = {
    전력: "#c2edff",
    온도: "#6ee6fb",
    수도: "#61a5ff",
    가스: "#52b7ff",
  };

  // 데이터 필터링
  const filteredData = {
    전력: selectedMetric === "전력" ? data.전력 : 30,
    온도: selectedMetric === "온도" ? data.온도 : 60,
    수도: selectedMetric === "수도" ? data.수도 : 20,
    가스: selectedMetric === "가스" ? data.가스 : 20,
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
    <div className=
        "w-full flex mt-12 select-none ">
      {/* ============================
          파이 차트
      ============================ */}
      <div className="w-[400px] h-[400px] ml-[-70px]">
        <Pie data={chartData} />
      </div>
    </div>
  );
}
