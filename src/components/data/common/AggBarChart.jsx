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

// ✅ metricConfig를 여기서 읽어오게 (경로는 네 프로젝트에 맞게)
import { metricConfig } from "../../../data/metricConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function buildColors(values, thresholds, palette) {
  const warn = thresholds?.warn ?? Number.POSITIVE_INFINITY;
  const danger = thresholds?.danger ?? Number.POSITIVE_INFINITY;

  // ✅ metricKey별 색(없으면 fallback)
  const normalColor = palette?.normal ?? palette?.line ?? "#F3D21B";
  const warnColor = palette?.warn ?? "#E54138";
  const dangerColor = palette?.danger ?? "#414141";

  return values.map((v) => {
    if (v >= danger) return dangerColor; // 위험
    if (v >= warn) return warnColor;     // 주의
    return normalColor;                  // 정상
  });
}

export default function AggBarChart({
  metricKey,       // ✅ 추가
  title,
  labels,
  rows,            // [{key, raw, value}]
  yMin = 0,
  yMax,
  unitLabel = "단위",
  thresholds,
}) {
  const values = rows.map((r) => Math.floor(Number(r.value) || 0));

  const cfg = metricKey ? metricConfig[metricKey] : null;
  const palette = cfg?.chart; // ✅ elec/gas/water/temp chart

  const colors = buildColors(values, thresholds, palette);

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
