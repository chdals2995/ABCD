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

// src/pages/data/Ddata.jsx

// ... import 들은 그대로 ...

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Ddata() {
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    async function fetchDaily() {
      try {
        const q = query(
          ref(rtdb, "aggDayBuilding"), // 실제 경로에 맞게
          orderByKey(),
          limitToLast(7)
        );
        const snap = await get(q);

        if (!snap.exists()) {
          setDailyData([]);
          return;
        }

        const rows = [];
        snap.forEach((child) => {
          const key = child.key;
          const val = child.val();
          rows.push({
            date: key,
            elecSum: val.elecSum ?? 0,
          });
        });

        rows.sort((a, b) => a.date.localeCompare(b.date));
        setDailyData(rows);
      } catch (err) {
        console.error("[Ddata] Firebase 읽기 에러:", err);
      }
    }

    fetchDaily();
  }, []);

  if (!dailyData.length) {
    return <p className="text-xs text-gray-500">로딩중...</p>;
  }

  // 라벨 "12.08(월)" 형태
  const labels = dailyData.map((d) => {
    const [year, month, day] = d.date.split("-");
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
    maintainAspectRatio: false, // ✅ 카드 높이에 맞게
    plugins: {
      legend: { display: false },
      title: { display: true, text: "최근 7일 전력 사용량" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    // ✅ 카드 전체를 쓰는 세로 flex
    <div className="flex h-full flex-col">
      {/* 차트 영역: 남는 높이 전부 */}
      <div className="flex-1 min-h-0">
        <Bar data={data} options={options} />
      </div>

      {/* 표 영역: 아래쪽, 가로 스크롤 가능 */}
      <div className="mt-1 overflow-x-auto">
        <table className="text-[11px] border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left w-20">구분</th>
              {labels.map((label) => (
                <th key={label} className="border px-2 py-1 text-center">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 text-left">전력 사용량 (kWh)</td>
              {dailyData.map((row) => (
                <td
                  key={row.date}
                  className="border px-2 py-1 text-right whitespace-nowrap"
                >
                  {row.elecSum.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  kWh
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

