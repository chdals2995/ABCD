// src/hooks/dataPage/useAggSeries.js
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, query, orderByKey, limitToLast, onValue, get } from "firebase/database";

function formatDayLabel(dateKey) {
  // "2025-12-15" -> "12.15(월)"
  const [y, m, d] = String(dateKey).split("-");
  const dateObj = new Date(`${y}-${m}-${d}T00:00:00+09:00`);
  const weekNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${m}.${d}(${weekNames[dateObj.getDay()]})`;
}

function formatMonthLabel(monthKey) {
  // "2025-12" -> "12월"
  const [, m] = String(monthKey).split("-");
  return `${m}월`;
}

export function useAggSeries({
  path,                 // ex) "aggDayBuilding", "aggMonthBuilding"
  limit = 7,
  sumField = "elecSum", // val[sumField]
  scale = (raw) => raw, // 함수 or 숫자(예: 10000)
  keyType = "day",      // "day" | "month"
  realtime = false,     // day/month는 보통 false(get)
} = {}) {
  const [rows, setRows] = useState([]);     // ✅ 항상 배열
  const [labels, setLabels] = useState([]); // ✅ 항상 배열
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scaler = useMemo(() => {
    if (typeof scale === "function") return scale;
    const s = Number(scale);
    if (!Number.isFinite(s) || s === 0 || s === 1) return (raw) => raw;
    return (raw) => Math.round(raw / s);
  }, [scale]);

  useEffect(() => {
    if (!path) {
      setRows([]);
      setLabels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(ref(rtdb, path), orderByKey(), limitToLast(limit));

    const applySnap = (snap) => {
      if (!snap.exists()) {
        setRows([]);
        setLabels([]);
        setLoading(false);
        return;
      }

      const obj = snap.val() || {};
      const keys = Object.keys(obj).sort();

      const nextRows = [];
      const nextLabels = [];

      for (const k of keys) {
        const raw = Number(obj[k]?.[sumField] ?? 0);
        const value = Number(scaler(raw) ?? 0);

        nextRows.push({ key: k, raw, value });

        if (keyType === "month") nextLabels.push(formatMonthLabel(k));
        else nextLabels.push(formatDayLabel(k));
      }

      setRows(nextRows);
      setLabels(nextLabels);
      setLoading(false);
    };

    if (realtime) {
      const unsub = onValue(
        q,
        (snap) => applySnap(snap),
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
      return () => unsub();
    } else {
      get(q)
        .then(applySnap)
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [path, limit, sumField, scaler, keyType, realtime]);

  // ✅ values도 같이 제공(혹시 다른 컴포넌트가 values를 쓰면 유지 가능)
  const values = useMemo(() => rows.map((r) => r.value), [rows]);

  return { rows, labels, values, loading, error };
}