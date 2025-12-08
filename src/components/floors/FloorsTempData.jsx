// src/components/adminpage/FloorsTempData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

function buildFloorIds(basementFloors, totalFloors) {
  const floors = [];

  for (let b = basementFloors; b >= 1; b--) {
    floors.push(`B${b}`);
  }

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

export default function FloorsTempData() {
  const [state, setState] = useState({
    loading: true,
    labels: [],
    values: [],
  });

  useEffect(() => {
    let isMounted = true;
    const INTERVAL_MS = 10 * 60 * 1000;

    async function fetchData() {
      try {
        const todayKey = formatDateKey(new Date());

        const configSnap = await get(ref(rtdb, "simConfig/default"));
        if (!configSnap.exists()) {
          if (!isMounted) return;
          console.warn("simConfig/default 없음");
          setState({ loading: false, labels: [], values: [] });
          return;
        }

        const config = configSnap.val() || {};
        const basementFloors = config.basementFloors ?? 0;
        const totalFloors = config.totalFloors ?? 0;
        const floorIds = buildFloorIds(basementFloors, totalFloors);

        const results = await Promise.all(
          floorIds.map(async (floorId) => {
            const daySnap = await get(
              ref(rtdb, `aggDay/${floorId}/${todayKey}`)
            );
            if (!daySnap.exists()) {
              return { floor: floorId, value: 0 };
            }

            const data = daySnap.val() || {};
            // tempAvg 우선, 없으면 tempSum / count 시도
            let temp = data.tempAvg;
            if (temp == null) {
              if (
                typeof data.tempSum === "number" &&
                typeof data.count === "number" &&
                data.count > 0
              ) {
                temp = data.tempSum / data.count;
              } else {
                temp = 0;
              }
            }
            return { floor: floorId, value: temp };
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
        console.error("FloorsTempData fetchData error:", err);
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

  const chartData = {
    labels,
    datasets: [
      {
        label: "오늘 평균 온도 (℃)",
        data: values,
        backgroundColor: "#F97373", // 온도는 붉은 계열
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
            return ` ${v.toLocaleString()} ℃`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "층" },
      },
      y: {
        beginAtZero: false,
        title: { display: true, text: "오늘 평균 온도 (℃)" },
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">층별 평균 온도 (오늘)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[260px]">
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            오늘 온도 데이터가 없습니다.
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
