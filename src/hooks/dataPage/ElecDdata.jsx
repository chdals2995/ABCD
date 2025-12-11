// src/hooks/dataPage/ElecDdata.js
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config"; // ← 경로 프로젝트 구조에 맞게 조정
import { ref, query, orderByKey, limitToLast, get } from "firebase/database";

export function ElecDdata() {
  const [dailyData, setDailyData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setLabels([]);
          setLoading(false);
          return;
        }

        const rows = [];
        snap.forEach((child) => {
          const key = child.key;
          const val = child.val();

          const rawElec = Number(val.elecSum ?? 0);
          const elec10k = Math.round(rawElec / 10000);
          rows.push({
            date: key,
            elecSum: elec10k,
            elecSumRaw : rawElec,
  
          });
        });

        rows.sort((a, b) => a.date.localeCompare(b.date));

        // 라벨 "12.08(월)" 형태
        const newLabels = rows.map((d) => {
          const [year, month, day] = d.date.split("-");
          const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
          const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
          const week = weekNames[dateObj.getDay()];
          return `${month}.${day}(${week})`;
        });

        setDailyData(rows);
        setLabels(newLabels);
      } catch (err) {
        console.error("[useDailyElecData] Firebase 읽기 에러:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDaily();
  }, []);

  return { dailyData, labels, loading };
}
