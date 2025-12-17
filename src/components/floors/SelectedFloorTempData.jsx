// src/components/floors/SelectedFloorTempData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import {
  ref,
  query,
  orderByKey,
  limitToLast,
  onValue,
} from "firebase/database";

const MAX_POINTS = 30;

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function roundN(v, digits = 1) {
  const num = Number(v);
  if (!Number.isFinite(num)) return 0;
  const p = 10 ** digits;
  return Math.round((num + Number.EPSILON) * p) / p;
}

function getYAxisRange(values) {
  const valid = values.filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );
  if (!valid.length) return { yMin: 0, yMax: 1 };

  let minVal = Math.min(...valid);
  let maxVal = Math.max(...valid);

  if (minVal === maxVal) {
    const padding = maxVal === 0 ? 1 : Math.abs(maxVal) * 0.5;
    return {
      yMin: roundN(minVal - padding, 1),
      yMax: roundN(maxVal + padding, 1),
    };
  }

  const range = maxVal - minVal;
  let yMin = minVal - range / 3;
  let yMax = maxVal + range / 3;

  return { yMin: roundN(yMin, 1), yMax: roundN(yMax, 1) };
}

// "HH:mm" → 분만 추출
function getMinuteFromLabel(label) {
  if (!label) return null;
  const parts = String(label).split(":");
  if (parts.length < 2) return null;
  const minute = Number(parts[1]);
  return Number.isFinite(minute) ? minute : null;
}

export default function SelectedFloorTempData({ floor }) {
  const [state, setState] = useState({
    loading: true,
    labels: [],
    values: [],
  });

  useEffect(() => {
    if (!floor) {
      setState({ loading: false, labels: [], values: [] });
      return;
    }

    let isMounted = true;
    const todayKey = formatDateKey(new Date());

    const q = query(
      ref(rtdb, `aggMinute/${floor}/${todayKey}`),
      orderByKey(),
      limitToLast(MAX_POINTS)
    );

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        if (!isMounted) return;

        const labels = [];
        const values = [];

        snapshot.forEach((child) => {
          const key = child.key || "";
          const v = child.val() || {};

          let temp = v.tempAvg ?? v.temp ?? null;

          if (
            temp == null &&
            typeof v.tempSum === "number" &&
            typeof v.count === "number" &&
            v.count > 0
          ) {
            temp = v.tempSum / v.count;
          }

          labels.push(key.slice(0, 5)); // "HH:mm"
          values.push(temp != null ? roundN(temp, 1) : 0); // ✅ 1자리 반올림
        });

        setState({ loading: false, labels, values });
      },
      (err) => {
        console.error("SelectedFloorTempData onValue error:", err);
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [floor]);

  const { loading, labels, values } = state;
  const { yMin, yMax } = getYAxisRange(values);

  const Y_TITLE = "온도 (℃)";

  const chartData = {
    labels,
    datasets: [
      {
        label: `${floor} ${Y_TITLE}`,
        data: values,
        borderColor: "#F97373",
        backgroundColor: "rgba(249,115,115,0.2)",
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y ?? 0;
            return ` ${roundN(v, 1).toFixed(1)} ℃`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "시간 (10분 단위)" },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            const minute = getMinuteFromLabel(label);
            if (minute == null || minute % 10 !== 0) return "";
            return label;
          },
        },
      },
      y: {
        min: yMin,
        max: yMax,
        beginAtZero: false,
        title: { display: true, text: Y_TITLE },
        ticks: {
          precision: 1, // ✅ Chart.js에게도 “소수 1자리” 힌트
          callback: (val) => roundN(val, 1).toFixed(1), // ✅ 눈금 표시 강제 포맷
        },
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{floor} 온도 (실시간)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[160px]">
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            실시간 온도 데이터가 없습니다.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
