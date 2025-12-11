// src/components/floors/FloorsGasData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function round1(v) {
  return Number(Number(v).toFixed(1));
}

// 🔹 값이 20~80% 영역에 오도록 y축 범위 계산
function getYAxisRange(values) {
  const valid = values.filter((v) => typeof v === "number" && !Number.isNaN(v));

  if (!valid.length) {
    return { yMin: 0, yMax: 1 };
  }

  let minVal = Math.min(...valid);
  let maxVal = Math.max(...valid);

  if (minVal === maxVal) {
    const padding = maxVal === 0 ? 1 : maxVal * 0.5;
    const yMin = Math.max(0, minVal - padding);
    const yMax = maxVal + padding;
    return { yMin, yMax };
  }

  const range = maxVal - minVal;
  let yMin = minVal - range / 3;
  let yMax = maxVal + range / 3;

  if (yMin < 0) yMin = 0;

  return { yMin, yMax };
}

export default function FloorsGasData({ floorIds = [], tall = false }) {
  const [state, setState] = useState({
    loading: true,
    labels: [],
    values: [],
  });

  // 🔹 모달에서는 더 큰 높이 사용
  const chartHeightClass = tall ? "h-[420px]" : "h-[260px]";

  useEffect(() => {
    let isMounted = true;
    const INTERVAL_MS = 10 * 60 * 1000;

    async function fetchData() {
      try {
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: true }));

        const todayKey = formatDateKey(new Date());
        const ids = Array.isArray(floorIds) ? floorIds : [];

        if (!ids.length) {
          if (!isMounted) return;
          setState({ loading: false, labels: [], values: [] });
          return;
        }

        const results = await Promise.all(
          ids.map(async (floorId) => {
            const daySnap = await get(
              ref(rtdb, `aggDay/${floorId}/${todayKey}`)
            );
            if (!daySnap.exists()) {
              return { floor: floorId, value: 0 };
            }

            const data = daySnap.val() || {};
            const gasSum = data.gasSum ?? 0;
            return { floor: floorId, value: gasSum };
          })
        );

        if (!isMounted) return;

        const labels = results.map((r) => r.floor);
        const values = results.map((r) => round1(r.value));

        setState({
          loading: false,
          labels,
          values,
        });
      } catch (err) {
        console.error("FloorsGasData fetchData error:", err);
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchData();
    const timerId = setInterval(fetchData, INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(timerId);
    };
  }, [floorIds]);

  const { loading, labels, values } = state;

  const { yMin, yMax } = getYAxisRange(values);

  const chartData = {
    labels,
    datasets: [
      {
        label: "오늘 가스 사용량 (ℓ)",
        data: values,
        backgroundColor: "#4F6150",
        borderRadius: 6,
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
            return ` ${v.toLocaleString()} ℓ`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "층" },
      },
      y: {
        min: yMin,
        max: yMax,
        beginAtZero: false,
        title: { display: true, text: "오늘 누적 가스 사용량 (ℓ)" },
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">층별 가스 사용량 (오늘 누적)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className={`w-full ${chartHeightClass}`}>
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            오늘 가스 사용 데이터가 없습니다.
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
