// src/components/adminpage/FloorsElecData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

// 🔹 simConfig/default 기준으로 층 ID 배열 만들기
// basementFloors=3, totalFloors=20 ➜ ["B3","B2","B1","1F",...,"17F"]
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
          console.warn("simConfig/default 없음");
          setState({ loading: false, labels: [], values: [] });
          return;
        }

        const config = configSnap.val() || {};
        const basementFloors = config.basementFloors ?? 0;
        const totalFloors = config.totalFloors ?? 0;

        const floorIds = buildFloorIds(basementFloors, totalFloors);

        // 디버그용으로 한 번 찍어보면 좋음
        console.log("floorIds:", floorIds, "todayKey:", todayKey);

        // 2️⃣ 각 층의 오늘 일일 전기 합계(elecSum) 읽기
        const results = await Promise.all(
          floorIds.map(async (floorId) => {
            const daySnap = await get(
              ref(rtdb, `aggDay/${floorId}/${todayKey}`)
            );

            if (!daySnap.exists()) {
              // 해당 층에 아직 데이터 없으면 0으로
              return { floor: floorId, value: 0 };
            }

            const data = daySnap.val() || {};
            const elecSum = data.elecSum ?? 0; // 필드 이름 다르면 여기만 수정
            console.log("aggDay", floorId, todayKey, "=", data); // 디버그용
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

    // 🔹 페이지 로드 시 한 번
    fetchData();

    // 🔹 이후 10분 간격으로 다시
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
        beginAtZero: true,
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
