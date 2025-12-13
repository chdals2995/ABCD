// src/components/data/ElecData/Tdata.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { ElecTdata } from "../../../hooks/dataPage/elec/ElecTdata";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Tdata({
  metric = "elecAvg",
  minutes = 60,
  unit = "kWh",
  thresholds = { warn: 0.8, danger: 0.9 },
  showStatusColor = false,
}) {
  const { labels, values, loading, lastKeyToday, day } = ElecTdata({
  metric,
  minutes,
  basePath: "aggMinuteBuilding",
});

  const data = {
    labels,
    datasets: [
      {
        label: "실시간",
        data: values,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
        borderColor: "#F97316",
        segment: showStatusColor
          ? {
              borderColor: (ctx) => {
                const y = ctx.p1.parsed.y;
                if (y >= thresholds.danger) return "#EF4444";
                if (y >= thresholds.warn) return "#F59E0B";
                return "#22C55E";
              },
            }
          : undefined,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: false,
          callback: (val, idx) => {
            const step = Math.max(1, Math.floor(labels.length / 6));
            return idx % step === 0 ? labels[idx] : "";
          },
        },
      },
      y: {
        grid: { display: true },
        ticks: {
          callback: (v) => Number(v).toLocaleString(), // ✅ 여기 수정
        },
        title: { display: true, text: `단위(${unit})` },
      },
    },
  };

  if (loading) return <div className="text-sm">로딩중...</div>;

  return (
  <div className="w-full h-full" style={{ height: 180 }}>
    <div className="text-[11px] mb-1 text-gray-600">
      마지막 데이터: {day} {lastKeyToday ?? "없음"}
    </div>
    <Line data={data} options={options} />
  </div>
);
}
