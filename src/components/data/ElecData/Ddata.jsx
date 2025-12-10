// src/pages/data/Ddata.jsx (예시 이름)

import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import {
  ref,
  query,
  orderByKey,
  limitToLast,
  get,               // 🔹 get 추가!
} from "firebase/database";

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

        // ✅ 현재 구조 가정: 루트에 2025-12-08 같은 날짜 키들이 있다.
        //  const q = query(ref(rtdb, "aggDay"), orderByKey(), limitToLast(7));

        

    const q = query(
      ref(rtdb, "aggDayBuilding"),
      orderByKey(),
      limitToLast(7)
    );

        // const q = query(ref(rtdb, "dailyStats"), orderByKey(), limitToLast(7));


        const snap = await get(q);
        console.log("[Ddata] snap.exists():", snap.exists());

        if (!snap.exists()) {
          console.log("[Ddata] 스냅샷 없음");
          setDailyData([]);
          return;
        }

        const rows = [];
        snap.forEach((child) => {
          const key = child.key;   // "2025-12-08"
          const val = child.val(); // { elecSum: ..., gasSum: ... }

          console.log("[Ddata] child:", key, val);

          rows.push({
            date: key,
            elecSum: val.elecSum ?? 0,
          });
        });

        // 날짜 오름차순 정렬
        rows.sort((a, b) => a.date.localeCompare(b.date));
        console.log("[Ddata] 최종 rows:", rows);

        setDailyData(rows);
      } catch (err) {
        console.error("[Ddata] Firebase 읽기 에러:", err);
      }
    }

    fetchDaily();
  }, []);

const labels = dailyData.map((d) => {
  // "2025-12-08" 을 [ "2025", "12", "08" ] 로 나누기
  const [year, month, day] = d.date.split("-");

  // 날짜 객체 만들기 (브라우저가 이해하기 쉬운 ISO 형식)
  const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);

  // 요일 배열 (0:일 ~ 6:토)
  const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
  const week = weekNames[dateObj.getDay()];

  // "12.08(월)" 형태로 반환
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

  if (!dailyData.length) {
    return <p>일별 데이터가 없습니다.</p>;
  }

  return <Bar data={data} options={options} />;
}
