// src/components/floors/SelectedFloorGasData.jsx
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
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYAxisRange(values) {
  const valid = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (!valid.length) return { yMin: 0, yMax: 1 };

  let minVal = Math.min(...valid);
  let maxVal = Math.max(...valid);

  if (minVal === maxVal) {
    const padding = maxVal === 0 ? 1 : maxVal * 0.5;
    return { yMin: Math.max(0, minVal - padding), yMax: maxVal + padding };
  }

  const range = maxVal - minVal;
  let yMin = minVal - range / 3;
  let yMax = maxVal + range / 3;
  if (yMin < 0) yMin = 0;
  return { yMin, yMax };
}

// "HH:mm" → 분만 추출
function getMinuteFromLabel(label) {
  if (!label) return null;
  const parts = String(label).split(":");
  if (parts.length < 2) return null;
  const minute = Number(parts[1]);
  return Number.isFinite(minute) ? minute : null;
}

export default function SelectedFloorGasData({ floor }) {
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
          const value = v.gasAvg ?? v.gasSum ?? v.gas ?? 0;

          labels.push(key.slice(0, 5)); // "HH:mm"
          values.push(Number(value) || 0);
        });

        setState({ loading: false, labels, values });
      },
      (err) => {
        console.error("SelectedFloorGasData onValue error:", err);
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

  const Y_TITLE = "가스 사용량 (ℓ)";

  const chartData = {
    labels,
    datasets: [
      {
        label: `${floor} ${Y_TITLE}`,
        data: values,
        borderColor: "#4F6150",
        backgroundColor: "rgba(79,97,80,0.2)",
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
            return ` ${Number(v).toLocaleString()} ℓ`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "시간 (10분 단위)" },
        ticks: {
          autoSkip: false,
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
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{floor} 가스 사용 (실시간)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[260px]">
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            실시간 가스 데이터가 없습니다.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
