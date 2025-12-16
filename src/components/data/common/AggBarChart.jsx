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
import { metricConfig } from "../metricConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function buildColors(values, thresholds, palette) {
  const warn = thresholds?.warn ?? Number.POSITIVE_INFINITY;
  const danger = thresholds?.danger ?? Number.POSITIVE_INFINITY;

  const normalColor = palette?.normal ?? palette?.line ?? "#F3D21B";
  const warnColor = palette?.warn ?? "#E54138";
  const dangerColor = palette?.danger ?? "#414141";

  return values.map((v) => {
    if (v >= danger) return dangerColor;
    if (v >= warn) return warnColor;
    return normalColor;
  });
}

export default function AggBarChart({
  metricKey,
  title,
  labels,
  rows,
  yMin = 0,
  yMax,
  unitLabel = "단위",
  thresholds,
}) {
  const values = rows.map((r) => {
    const n = Number(r?.value ?? 0);
    return Number.isFinite(n) ? Math.floor(n) : 0;
  });

  const cfg = metricKey ? metricConfig[metricKey] : null;
  const palette = cfg?.chart;

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
          // ✅ “표시값 + 단위”
          label: (ctx) => `${Number(ctx.raw ?? 0).toLocaleString()} ${unitLabel}`,
          // ✅ “원본(raw)”
          afterLabel: (ctx) => {
            const idx = ctx.dataIndex;
            const raw = rows[idx]?.raw ?? 0;
            return `원본: ${Number(raw).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 12 }, // ✅ 여기!
        },
      },
      y: {
        min: yMin,
        ...(Number.isFinite(Number(yMax)) ? { max: Number(yMax) } : {}), // ✅ yMax 없으면 max 제거
        beginAtZero: true,
        title: { display: true, text: unitLabel, align: "start" },
        ticks: {
          callback: (v) => Number(v).toLocaleString(),
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
