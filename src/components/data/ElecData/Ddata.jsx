// src/pages/data/Ddata.jsx

import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, query, orderByKey, limitToLast, get } from "firebase/database";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Ddata() {
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    console.log("[Ddata] useEffect 시작");

    async function fetchDaily() {
      try {
        console.log("[Ddata] Firebase 쿼리 준비");

        // TODO: 실제 구조에 맞게 경로 조정 (예: "aggDayBuilding/빌딩ID")
        const q = query(ref(rtdb, "aggDayBuilding"), orderByKey(), limitToLast(7));

        const snap = await get(q);
        console.log("[Ddata] snap.exists():", snap.exists());

        if (!snap.exists()) {
          console.log("[Ddata] 스냅샷 없음");
          setDailyData([]);
          return;
        }

        const rows = [];
        snap.forEach((child) => {
          const key = child.key;   // 예: "2025-12-08"
          const val = child.val(); // { elecSum: ..., ... }

          console.log("[Ddata] child:", key, val);

          rows.push({
            date: key,
            elecSum: val.elecSum ?? 0,
          });
        });

        rows.sort((a, b) => a.date.localeCompare(b.date));
        console.log("[Ddata] 최종 rows:", rows);

        setDailyData(rows);
      } catch (err) {
        console.error("[Ddata] Firebase 읽기 에러:", err);
      }
    }

    fetchDaily();
  }, []);

  if (!dailyData.length) {
    return <p>로딩중...</p>;
  }

  // ✅ 라벨 "12.08(월)" 형태로 만들기
  const labels = dailyData.map((d) => {
    const [year, month, day] = d.date.split("-"); // "2025-12-08"

    const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
    const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
    const week = weekNames[dateObj.getDay()];

    return `${month}.${day}(${week})`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: "일별 전력 사용량 (kWh)",
        data: dailyData.map((d) => d.elecSum),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "최근 7일 전력 사용량" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // ✅ 차트 + 표 같이 렌더링
  return (
    <div className="space-y-4">
      {/* 막대 차트 */}
      <Bar data={data} options={options} />

      {/* 아래 표 */}
      <table className="w-full text-sm border-collapse mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">날짜</th>
            <th className="border px-2 py-1 text-right">전력 사용량 (kWh)</th>
          </tr>
        </thead>
        <tbody>
          {dailyData.map((row, idx) => (
            <tr key={row.date}>
              {/* 라벨: "12.08(월)" */}
              <td className="border px-2 py-1">{labels[idx]}</td>
              {/* 값: 12,345.67 형식 + 단위 */}
              <td className="border px-2 py-1 text-right">
                {row.elecSum.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                kWh
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
