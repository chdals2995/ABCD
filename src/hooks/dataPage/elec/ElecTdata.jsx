// src/hooks/dataPage/elec/Electdata.js
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../../firebase/config"; // 경로 맞춰줘
import { ref, query, orderByKey, limitToLast, onValue } from "firebase/database";

// KST 기준 YYYY-MM-DD (브라우저가 한국이면 보통 그냥 써도 OK)
function getDateKeyKST(d = new Date()) {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export function ElecTdata({
  basePath = "aggMinuteBuilding",
  metric = "elecAvg",      // "elecSum" 등으로 바꿔 끼우기
  minutes = 60,            // 최근 60분
  dateKey,                 // 필요하면 외부에서 "2025-12-08" 같은 값 주기
} = {}) {
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);

  const day = useMemo(() => dateKey ?? getDateKeyKST(), [dateKey]);

  useEffect(() => {
    setLoading(true);

    const dayRef = ref(rtdb, `${basePath}/${day}`);
    const q = query(dayRef, orderByKey(), limitToLast(minutes));

    const unsub = onValue(
      q,
      (snap) => {
        const obj = snap.val() || {};
        const keys = Object.keys(obj).sort();     // "11:05" 같은 키 정렬

        setLabels(keys);
        setValues(keys.map((k) => Number(obj[k]?.[metric] ?? 0)));
        setLoading(false);
      },
      (err) => {
        console.error("[RTDB onValue] error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [basePath, day, metric, minutes]);

  return { labels, values, loading, day };
}
