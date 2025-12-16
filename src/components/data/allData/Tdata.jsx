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
  yMin,
  yMax,                   // ✅ 필요하면 override (없으면 자동)
  showStatusColor = true,
  thresholds,             // ✅ 필요하면 override (없으면 cfg.day.thresholds 사용)
  height = 280,           // ✅ 차트 높이
}) {  
 
  const cfg = metricConfig[metricKey] ?? metricConfig.elec;
  const rt = cfg.realtime ?? { path: "aggMinuteBuilding", metricField: "elecAvg", minutes: 60 };

  const finalMinutes = minutes ?? rt.minutes ?? 60;
  const finalThresholds =
  thresholds ?? rt.thresholds ?? cfg.day?.thresholds ?? { warn: 0.8, danger: 0.9 };

  // ✅ 색(정상은 metricKey 컬러)
const normalColor = cfg.chart?.line ?? "#aaaaaa";
const warnColor = "#FFC107";
const dangerColor = "#FF3B30";


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
    data: values.map((v) => Number(v) || 0),
    tension: 0.35,

    pointRadius: 3,
    pointHoverRadius: 5,
    pointHitRadius: 10,
    pointBorderWidth: 2,

    // ✅ 점도 같이 구간색으로 (원하면)
    pointBorderColor: (ctx) => {
      const y = ctx?.parsed?.y ?? 0;
      if (y >= finalThresholds.danger) return dangerColor;
      if (y >= finalThresholds.warn) return warnColor;
      return normalColor;
    },
    pointBackgroundColor: "#fff",

    borderWidth: 3,
    borderColor: normalColor, // 기본(정상)색

    // ✅ 선이 warn/danger 범위 들어가면 해당 구간만 색 변경
    segment: {
      borderColor: (ctx) => {
        const y = ctx?.p1?.parsed?.y ?? 0;
        if (y >= finalThresholds.danger) return dangerColor;
        if (y >= finalThresholds.warn) return warnColor;
        return normalColor;
      },
    },
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

  // ✅ y축 범위는 "내가 지정한 값"만 사용
// 우선순위: props(yMin/yMax) > metricConfig.realtime.y > (최종 fallback)

if (!rt.y || rt.y.min === undefined || rt.y.max === undefined) {
  return <div className="text-sm text-red-500">realtime.y(min/max) 설정이 필요합니다.</div>;
}

const finalYMin = (yMin !== undefined ? yMin : (rt.y?.min ?? 0));
const finalYMax = (yMax !== undefined ? yMax : (rt.y?.max ?? 30)); // fallback도 고정값

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
        min: finalYMin,
        max: finalYMax,
        grid: { display: true },
        ticks: { callback: (v) => Number(v).toLocaleString() },
        title: { display: true, text: `단위(${cfg.unit})`, align: "end" },
      },
    },
  }
  
  return (
    <div className="w-full">
      <h2 className="font-semibold text-base mt-[20px] ml-[10px]">
        (건물) {cfg.label} 실시간 사용량 그래프
      </h2>

      <div className="w-[500px] h-[300px] absolute top-[55%] left-[50%] translate-x-[-52%] translate-y-[-50%]">
        <Line data={data} options={options}/>
      </div>
    </div>
  );
}
