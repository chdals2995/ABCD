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

  // 범례 글씨 크기 조절
  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 18,
            weight: "bold",
          },
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="w-full flex mt-12 select-none">
      <div className="w-[480px] h-[480px] mt-[-20px]  ml-[-30px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
