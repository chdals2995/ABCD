// src/components/adminpage/FloorsElecData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

function buildFloorIds(basementFloors, totalFloors) {
  const floors = [];

  // 지하층 (B3, B2, B1 ... 순서)
  for (let b = basementFloors; b >= 1; b--) {
    floors.push(`B${b}`);
  }

  // 지상층 (1F, 2F, ...)
  const groundFloors = totalFloors - basementFloors;
  for (let f = 1; f <= groundFloors; f++) {
    floors.push(`${f}F`);
  }

  return floors;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function round1(v) {
  return Number(Number(v).toFixed(1));
}

// 🔹 values 범위를 20%~80% 구간에 오도록 y축 min/max 계산
function getYAxisRange(values) {
  const valid = values.filter((v) => typeof v === "number" && !Number.isNaN(v));

  if (!valid.length) {
    return { yMin: 0, yMax: 1 };
  }

  let minVal = Math.min(...valid);
  let maxVal = Math.max(...valid);

  // 값이 전부 같을 때 (flat) → 위/아래로 여유만 조금 줌
  if (minVal === maxVal) {
    const padding = maxVal === 0 ? 1 : maxVal * 0.5;
    const yMin = Math.max(0, minVal - padding);
    const yMax = maxVal + padding;
    return { yMin, yMax };
  }

  const range = maxVal - minVal;

  // 이론적으로 20%~80%에 오도록 만드는 값
  let yMin = minVal - range / 3; // min - 1/3 range
  let yMax = maxVal + range / 3; // max + 1/3 range

  // 에너지 사용량이라 음수는 의미 없으니 0 아래로는 잘라줌
  if (yMin < 0) yMin = 0;

  return { yMin, yMax };
}

export default function FloorsElecData() {
  const [state, setState] = useState({
    loading: true,
    labels: [],
    values: [],
  });

  useEffect(() => {
    let isMounted = true;
    const INTERVAL_MS = 10 * 60 * 1000; // 10분

    async function fetchData() {
      try {
        const todayKey = formatDateKey(new Date());

        // 1️⃣ simConfig/default에서 층 정보 읽기
        const configSnap = await get(ref(rtdb, "simConfig/default"));
        if (!configSnap.exists()) {
          if (!isMounted) return;
          setState({ loading: false, labels: [], values: [] });
          return;
        }

        const config = configSnap.val() || {};
        const basementFloors = config.basementFloors ?? 0;
        const totalFloors = config.totalFloors ?? 0;

        const floorIds = buildFloorIds(basementFloors, totalFloors);

        // 2️⃣ 각 층의 오늘 일일 전기 합계(elecSum) 읽기
        const results = await Promise.all(
          floorIds.map(async (floorId) => {
            const daySnap = await get(
              ref(rtdb, `aggDay/${floorId}/${todayKey}`)
            );

            if (!daySnap.exists()) {
              return { floor: floorId, value: 0 };
            }

            const data = daySnap.val() || {};
            const elecSum = data.elecSum ?? 0;
            return { floor: floorId, value: elecSum };
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
        console.error("FloorsElecData fetchData error:", err);
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
  }, []);

  const { loading, labels, values } = state;

  // 🔹 y축 범위 계산 (막대가 20~80% 안쪽에 오도록)
  const { yMin, yMax } = getYAxisRange(values);

  const chartData = {
    labels,
    datasets: [
      {
        label: "오늘 전기 사용량 (kWh)",
        data: values,
        backgroundColor: "#FF9130",
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
            return ` ${v.toLocaleString()} kWh`;
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
        beginAtZero: false, // min/max를 직접 지정했으니 false로
        title: { display: true, text: "오늘 누적 전기 사용량 (kWh)" },
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">층별 전기 사용량 (오늘 누적)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[260px]">
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            오늘 전기 사용 데이터가 없습니다.
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
