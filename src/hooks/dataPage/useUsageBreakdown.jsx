import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue, query, orderByKey, startAt, endAt } from "firebase/database";
import { metricConfig } from "../../components/data/metricConfig";


function getSeoulDateKey(d = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(d); // YYYY-MM-DD
}
function getSeoulMonthKey(d = new Date()) {
  return getSeoulDateKey(d).slice(0, 7); // YYYY-MM
}
function safeNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function useUsageBreakdown({ metricKey = "elec", period = "day" } = {}) {
  const cfg = metricConfig[metricKey] ?? metricConfig.elec;
  const b = cfg.breakdown;

  const todayKey = useMemo(() => getSeoulDateKey(new Date()), []);
  const monthKey = useMemo(() => getSeoulMonthKey(new Date()), []);
  const yearKey = useMemo(() => monthKey.slice(0, 4), [monthKey]);

  const [loading, setLoading] = useState(true);
  const [breakdownObj, setBreakdownObj] = useState({}); // { aircon: 123, light: 456 ... }

  // ✅ day / month는 “해당 키의 breakdown object”만 읽기
  useEffect(() => {
    if (!b?.dayPath || !b?.monthPath) return;

    setLoading(true);

    if (period === "day") {
      const r = ref(rtdb, `${b.dayPath}/${todayKey}/${b.dayField}`);
      const unsub = onValue(
        r,
        (snap) => {
          setBreakdownObj(snap.val() || {});
          setLoading(false);
        },
        (err) => {
          console.error("[useUsageBreakdown day] error:", err);
          setBreakdownObj({});
          setLoading(false);
        }
      );
      return () => unsub();
    }

    if (period === "month") {
      const r = ref(rtdb, `${b.monthPath}/${monthKey}/${b.monthField}`);
      const unsub = onValue(
        r,
        (snap) => {
          setBreakdownObj(snap.val() || {});
          setLoading(false);
        },
        (err) => {
          console.error("[useUsageBreakdown month] error:", err);
          setBreakdownObj({});
          setLoading(false);
        }
      );
      return () => unsub();
    }

    // ✅ year(YTD): 월별 breakdown들을 합산
    if (period === "year") {
      const start = `${yearKey}-01`;
      const endK = `${yearKey}-12\uf8ff`;
      const q = query(ref(rtdb, b.monthPath), orderByKey(), startAt(start), endAt(endK));

      const unsub = onValue(
        q,
        (snap) => {
          const obj = snap.val() || {};
          const acc = {};

          Object.entries(obj).forEach(([k, v]) => {
            if (k > monthKey) return; // 현재 월까지만(YTD)
            const bd = v?.[b.monthField] || {};
            for (const { key } of b.categories) {
              acc[key] = safeNum(acc[key]) + safeNum(bd[key]);
            }
          });

          setBreakdownObj(acc);
          setLoading(false);
        },
        (err) => {
          console.error("[useUsageBreakdown year] error:", err);
          setBreakdownObj({});
          setLoading(false);
        }
      );

      return () => unsub();
    }
  }, [metricKey, period, todayKey, monthKey, yearKey]); // cfg 바뀌면 자동 재조회

  // ✅ 차트에 쓸 labels/values 만들기
  const { labels, values, total } = useMemo(() => {
    const cats = b?.categories ?? [];
    const vals = cats.map((c) => safeNum(breakdownObj?.[c.key]));
    const sum = vals.reduce((a, x) => a + x, 0);
    return {
      labels: cats.map((c) => c.label),
      values: vals,
      total: sum,
    };
  }, [breakdownObj, metricKey]);

  return {
    loading,
    labels,
    values,
    total,
    unit: cfg.unit,
    meta: { todayKey, monthKey, yearKey },
  };
}
