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
import { metricConfig } from "../metricConfig";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Tdata({
  metricKey = "elec",      // ✅ 이것만 바꾸면 전기/가스/수도/온도 변경
  minutes,                // ✅ 필요하면 override (기본 config.realtime.minutes)
  yMin = 0,
  yMax,                   // ✅ 필요하면 override (없으면 자동)
  showStatusColor = true,
  thresholds,             // ✅ 필요하면 override (없으면 cfg.day.thresholds 사용)
  height = 280,           // ✅ 차트 높이
}) {  
  const cfg = metricConfig[metricKey] ?? metricConfig.elec;

  // ✅ realtime 설정
  const rt = cfg.realtime ?? { path: "aggMinuteBuilding", metricField: "elecAvg", minutes: 60 };

  const finalMinutes = minutes ?? rt.minutes ?? 60;
  const finalThresholds = thresholds ?? cfg.day?.thresholds ?? { warn: 0.8, danger: 0.9 };

  const { labels, values, loading, lastKey, todayKey } = useAggMinuteSeries({
    basePath: rt.path ?? "aggMinuteBuilding",
    metricField: rt.metricField ?? "elecAvg",
    minutes: finalMinutes,
  });

  if (loading) return <div className="text-sm">로딩중...</div>;
  if (!labels.length){
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
        label: `${cfg.label} 실시간`,
        data: values,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 3,
        borderColor: "#F97316",
        segment: showStatusColor
          ? {
              borderColor: (ctx) => {
                const y = ctx?.p1?.parsed?.y ?? 0;
                if (y >= finalThresholds.danger) return "#FF3B30"; // 위험
                if (y >= finalThresholds.warn) return "#FFC107";   // 주의
                return "#28C76F";                                  // 정상
              },
            }
          : undefined,
      },
    ],
  };

  // ✅ yMax 자동 계산(override 없을 때)
  const autoMax = (() => {
    const maxV = Math.max(...values.map((v) => Number(v) || 0));
    if (!Number.isFinite(maxV)) return undefined;
    // 약간 여유
    return Math.ceil(maxV * 1.15 * 10) / 10;
  })();

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
        min: 0,
        max: 30,
        grid: { display: true },
        ticks: { callback: (v) => Number(v).toLocaleString() },
        title: { display: true, text: `단위(${cfg.unit})`, align: "end" },
      },
    },
  };

  return (
    <div className="w-full">
      <h2 className="font-semibold text-base mt-[20px] ml-[10px]">
        (건물) {cfg.label} 실시간 사용량 그래프
      </h2>

      <div className="w-[500px] h-[300px] absolute top-[55%] left-[50%] translate-x-[-52%] translate-y-[-50%]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
