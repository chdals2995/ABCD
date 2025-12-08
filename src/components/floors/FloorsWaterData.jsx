// src/components/adminpage/FloorsWaterData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

// simConfig/default 기준으로 층 ID 배열 만들기
function buildFloorIds(basementFloors, totalFloors) {
  const floors = [];

  // 지하층 (B3, B2, B1 ...)
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
  return `${y}-${m}-${d}`; // "YYYY-MM-DD"
}

function round1(v) {
  return Number(Number(v).toFixed(1));
}

export default function FloorsWaterData() {
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
          console.warn("simConfig/default 없음");
          setState({ loading: false, labels: [], values: [] });
          return;
        }

        const config = configSnap.val() || {};
        const basementFloors = config.basementFloors ?? 0;
        const totalFloors = config.totalFloors ?? 0;

        const floorIds = buildFloorIds(basementFloors, totalFloors);

        // 2️⃣ 각 층의 오늘 일일 수도 합계(waterSum) 읽기
        const results = await Promise.all(
          floorIds.map(async (floorId) => {
            const daySnap = await get(
              ref(rtdb, `aggDay/${floorId}/${todayKey}`)
            );
            if (!daySnap.exists()) {
              return { floor: floorId, value: 0 };
            }

            const data = daySnap.val() || {};
            const waterSum = data.waterSum ?? 0;
            return { floor: floorId, value: waterSum };
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
        console.error("FloorsWaterData fetchData error:", err);
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    // 처음 1번 실행
    fetchData();

    // 이후 10분마다 실행
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
        label: "오늘 수도 사용량 (㎥)",
        data: values,
        backgroundColor: "#0004FF", // 물 색
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
            return ` ${v.toLocaleString()} ㎥`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "층" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "오늘 누적 수도 사용량 (㎥)" },
      },
    },
  };

  return (
    <div className="w-full h-full border border-gray-200 rounded-[10px] bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">층별 수도 사용량 (오늘 누적)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      <div className="w-full h-[260px]">
        {labels.length === 0 && !loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            오늘 수도 사용 데이터가 없습니다.
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
