// src/hooks/dataPage/ElecDdata.js  안에 같이 두거나 파일 나눠도 됨
import { useEffect, useState } from "react";
import { ref, query, orderByKey, limitToLast, get } from "firebase/database";
import { rtdb } from "../../firebase/config";

export function ElecMdata() {
  const [monthData, setMonthData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonth() {
      try {
        const q = query(
          ref(rtdb, "aggMonthBuilding"),
          orderByKey(),
          limitToLast(12)          // 최근 12개월
        );

        const snap = await get(q);

        if (!snap.exists()) {
          setMonthData([]);
          setLabels([]);
          setLoading(false);
          return;
        }

        const rows = [];

        snap.forEach((child) => {
          const key = child.key;     // 예: "2025-12"
          const val = child.val() || {};

          rows.push({
            monthKey: key,
            elecSum: Number(val.elecSum ?? 0),

            // 나중에 쓰일 수 있게 같이 넣어두기 (eventCounts 안에 있음)
            alarmCount: Number(val.alarmCount ?? 0),
            count: Number(val.count ?? 0),
            gasSum: Number(val.eventCounts?.gasSum ?? 0),
            tempAvg: Number(val.eventCounts?.tempAvg ?? 0),
            tempSum: Number(val.eventCounts?.tempSum ?? 0),
            waterSum: Number(val.eventCounts?.waterSum ?? 0),
          });
        });

        // 키 기준 정렬 (2025-09, 2025-10, ...)
        rows.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

        // 라벨: "2025-12" -> "12월" (원하는 형식으로 바꿔도 됨)
        const newLabels = rows.map((m) => {
          const [year, month] = m.monthKey.split("-"); // "2025", "12"
          // return `${year}.${month}`;       // 이렇게 써도 되고
          return `${month}월`;                 // 🔹 지금은 "12월" 형식
        });

        setMonthData(rows);
        setLabels(newLabels);
      } catch (err) {
        console.error("[ElecMdata] Firebase 읽기 에러:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMonth();
  }, []);

  // daily 훅이랑 비슷한 형태로 반환
  return { monthData, labels, loading };
}
