// src/components/data/allData/Tdata.jsx
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
import { useAggMinuteSeries } from "../../../hooks/dataPage/useAggMinuteSeries";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Tdata({
  metricField = "elecAvg",
  minutes = 60,
  unit = "kWh",
  yMin = 0,
  yMax = 30,

  // ✅ 구간색 필요하면 이거 켜기
  showStatusColor = true,
  thresholds = { warn: 20, danger: 25 },
}) {
  const { labels, values, loading, lastKey, todayKey } = useAggMinuteSeries({
    basePath: "aggMinuteBuilding",
    metricField,
    minutes,
  });

  if (loading) return <div className="text-sm">로딩중...</div>;
  if (!labels.length) {
    return (
      <div className="text-sm">
        데이터 없음 (마지막: {todayKey} {lastKey ?? "없음"})
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "실시간",
        data: values,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 3,
        borderColor: "#F97316",
        segment: showStatusColor
          ? {
              borderColor: (ctx) => {
                const y = ctx?.p1?.parsed?.y ?? 0;
                if (y >= thresholds.danger) return "#FF3B30";
                if (y >= thresholds.warn) return "#FFC107";
                return "#28C76F";
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
        min: yMin,
        max: yMax,
        grid: { display: true },
        ticks: { callback: (v) => Number(v).toLocaleString() },
        title: { display: true, text: `단위(${unit})`, align: "end"},
      },
    },
  };

  return (
    <>
     <h2 className="font-semibold text-base mt-[20px] ml-[10px]">(건물)실시간 사용량 그래프</h2>
     <div className="w-[450px] h-[280px] absolute left-[50%] top-[50%] translate-x-[-50%] translate-[-50%]">
      <Line data={data} options={options} />
     </div>
    </>
  );
}
