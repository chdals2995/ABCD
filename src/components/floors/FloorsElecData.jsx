// src/components/adminpage/FloorsElecData.jsx
import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";

// 🔹 RTDB에서 층 정보를 읽어올 경로 (실제 구조에 맞게 수정)
// 예: buildingFloors = { "B2": true, "B1": true, "1F": true, "2F": true, ... }
const FLOORS_PATH = "buildingFloors"; // <= 이 부분만 네 구조에 맞게 바꾸면 됨

// 층 문자열(B2, B1, 1F, 2F...)을 "정렬용 숫자"로 변환
// B2 -> -2, B1 -> -1, 1F -> 1, 2F -> 2 이런 식
function toFloorIndex(floor) {
  if (typeof floor !== "string") return 9999;

  if (floor.startsWith("B")) {
    const n = parseInt(floor.slice(1), 10); // "B2" -> 2
    if (Number.isNaN(n)) return -9999;
    return -n; // B2(-2), B1(-1) → 지하가 더 작은 값(위로 오도록)
  }

  // "1F", "2F", "10F" 같은 건 숫자 부분만 파싱
  const num = parseInt(floor, 10);
  if (!Number.isNaN(num)) return num;

  return 9999;
}

function sortFloors(a, b) {
  return toFloorIndex(a) - toFloorIndex(b);
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

        // 1️⃣ 층 목록 가져오기
        const floorsSnap = await get(ref(rtdb, FLOORS_PATH));

        if (!floorsSnap.exists()) {
          if (!isMounted) return;
          setState({
            loading: false,
            labels: [],
            values: [],
          });
          return;
        }

        const floorsData = floorsSnap.val() || {};

        // floorsData가 { "B2": {...}, "B1": {...}, "1F": {...} } 이런 구조라고 가정
        // key를 층 이름으로 사용
        let floors = Object.keys(floorsData);

        // 지하 → 지상 순으로 정렬
        floors = floors.sort(sortFloors);

        // 2️⃣ 각 층의 오늘 일일 전기 합계(elecSum) 가져오기
        const results = await Promise.all(
          floors.map(async (floor) => {
            const daySnap = await get(ref(rtdb, `aggDay/${floor}/${todayKey}`));
            if (!daySnap.exists()) {
              return { floor, value: 0 };
            }

            const data = daySnap.val() || {};
            const elecSum = data.elecSum ?? 0; // 필드 이름 다르면 여기 수정
            return { floor, value: elecSum };
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

    // 🔹 페이지 로드 시 1번 실행
    fetchData();

    // 🔹 이후 10분 간격으로 반복 실행
    const timerId = setInterval(fetchData, INTERVAL_MS);

    // 언마운트 시 클린업
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
        backgroundColor: "#0888D4",
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
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">층별 전기 사용량 (오늘 누적)</h2>
        {loading && (
          <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
        )}
      </div>

      {/* 차트 영역 */}
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
