// src/components/data/common/AggBarChart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function buildColors(values, thresholds) {
  const warn = thresholds?.warn ?? Number.POSITIVE_INFINITY;
  const danger = thresholds?.danger ?? Number.POSITIVE_INFINITY;

  return values.map((v) => {
    if (v >= danger) return "#414141";   // 위험
    if (v >= warn) return "#E54138";     // 주의
    return "#F3D21B";                   // 정상
  });
}

export default function AggBarChart({
  title,
  labels,
  rows,          // [{key, raw, value}]
  yMin = 0,
  yMax,
  unitLabel = "단위",
  thresholds,
}) {
  const values = rows.map((r) => Math.floor(Number(r.value) || 0));
  const colors = buildColors(values, thresholds);

  const data = {
    labels,
    datasets: [
      {
        label: title ?? "",
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          // tooltip에 원본(raw)도 같이 보여주고 싶으면 여기서 사용
          afterLabel: (ctx) => {
            const idx = ctx.dataIndex;
            const raw = rows[idx]?.raw ?? 0;
            return `원본: ${Number(raw).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        min: yMin,
        max: yMax,
        beginAtZero: true,
        title: { display: true, text: unitLabel, align: "end" },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
