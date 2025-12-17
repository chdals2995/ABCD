// src/hooks/useProblems.js
import { useEffect, useState } from "react";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { metricConfig } from "../../components/data/metricConfig";
import { rtdb } from "../../firebase/config";

export function useProblems({ metricKey = "elec", limit = 8, status }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cfg = metricConfig?.[metricKey]?.problems;
    const type = cfg?.type;
    const path = cfg?.path ?? "problems";

    if (!type) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const baseRef = ref(rtdb, `${path}/${type}`);
    const q = query(baseRef, orderByChild("createdAt"), limitToLast(limit));

    const unsub = onValue(q, (snap) => {
      setLoading(false);

      if (!snap.exists()) {
        setItems([]);
        return;
      }

      const raw = snap.val();
      const list = Object.entries(raw).map(([id, v]) => ({ id, ...v }));

      // 최신순 정렬
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

      const filtered = status ? list.filter((x) => x.status === status) : list;
      setItems(filtered);
    });

    return () => unsub();
  }, [metricKey, limit, status]);

  return { items, loading };
}
