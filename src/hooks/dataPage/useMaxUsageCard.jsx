import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../firebase/config";
import { get, ref } from "firebase/database";

// ---- KST helpers ----
function toKstDate(d = new Date()) {
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
}
function getDateKeyKST(d = new Date()) {
  return toKstDate(d).toISOString().slice(0, 10); // YYYY-MM-DD
}
function getMonthKeyKST(d = new Date()) {
  return toKstDate(d).toISOString().slice(0, 7); // YYYY-MM
}
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function addMonths(d, months) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function hourToRange(hh) {
  const h = String(hh).padStart(2, "0");
  const next = String((Number(hh) + 1) % 24).padStart(2, "0");
  return `${h}:00 ~ ${next}:00`;
}

function normalizeHourKey(k) {
  // "13" / "13:00" / "13:30" -> "13"
  const s = String(k ?? "");
  const m = s.match(/^(\d{1,2})/);
  if (!m) return null;
  const hh = Number(m[1]);
  if (!Number.isFinite(hh) || hh < 0 || hh > 23) return null;
  return String(hh).padStart(2, "0");
}

function safeNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * ✅ 전기/가스/수도 MaxData에 필요한 데이터 모음 훅
 *
 * 기본 가정(필요 시 props로 변경 가능):
 * - aggDayBuilding/{YYYY-MM-DD}      -> { [sumField]: number }
 * - aggMonthBuilding/{YYYY-MM}       -> { [sumField]: number }
 * - aggHourBuilding/{YYYY-MM-DD}     -> { "13": { [sumField]: number }, ... } (있으면 피크 계산)
 * - top3:
 *   - placeKeysPath 에 placeKey 목록(층/구역/룸 등)
 *   - dayPerPlacePath/{placeKey}/{YYYY-MM-DD} -> { [sumField]: number }
 */
export function useMaxUsageCard({
  // metric
  sumField = "elecSum",
  unit = "kWh",
  valueScale = (v) => v, // 필요하면: (v) => Math.round(v / 10000)

  // paths
  dayBuildingPath = "aggDayBuilding",
  monthBuildingPath = "aggMonthBuilding",
  hourBuildingPath = "aggHourBuilding",

  // top3
  placeKeysPath = "floors",
  dayPerPlacePath = "aggDay",
  topN = 3,

  // refresh
  refreshMs = null, // 예: 60000
} = {}) {
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState({
    todayKey: "",
    monthKey: "",
    todayValue: 0,
    monthValue: 0,
    deltaDay: 0,
    deltaMonth: 0,
    peakRange: "",
    topPlaces: [], // [{ key, value }]
  });

  const todayKey = useMemo(() => getDateKeyKST(new Date()), []);
  const ydayKey = useMemo(() => getDateKeyKST(addDays(new Date(), -1)), []);
  const monthKey = useMemo(() => getMonthKeyKST(new Date()), []);
  const prevMonthKey = useMemo(() => getMonthKeyKST(addMonths(new Date(), -1)), []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      try {
        // 1) building day/month
        const [todaySnap, ydaySnap, monthSnap, prevMonthSnap] = await Promise.all([
          get(ref(rtdb, `${dayBuildingPath}/${todayKey}`)),
          get(ref(rtdb, `${dayBuildingPath}/${ydayKey}`)),
          get(ref(rtdb, `${monthBuildingPath}/${monthKey}`)),
          get(ref(rtdb, `${monthBuildingPath}/${prevMonthKey}`)),
        ]);

        const rawToday = safeNum(todaySnap.val()?.[sumField]);
        const rawYday = safeNum(ydaySnap.val()?.[sumField]);
        const rawMonth = safeNum(monthSnap.val()?.[sumField]);
        const rawPrevMonth = safeNum(prevMonthSnap.val()?.[sumField]);

        const todayVal = safeNum(valueScale(rawToday));
        const ydayVal = safeNum(valueScale(rawYday));
        const monthVal = safeNum(valueScale(rawMonth));
        const prevMonthVal = safeNum(valueScale(rawPrevMonth));

        // 2) peak hour (있으면 계산)
        let peakRange = "";
        try {
          const hourSnap = await get(ref(rtdb, `${hourBuildingPath}/${todayKey}`));
          if (hourSnap.exists()) {
            const obj = hourSnap.val() || {};
            let bestHH = null;
            let bestV = -Infinity;

            Object.entries(obj).forEach(([k, v]) => {
              const hh = normalizeHourKey(k);
              if (!hh) return;
              const raw = safeNum(v?.[sumField]);
              const vv = safeNum(valueScale(raw));
              if (vv > bestV) {
                bestV = vv;
                bestHH = hh;
              }
            });

            if (bestHH != null) peakRange = hourToRange(bestHH);
          }
        } catch (e) {
          // hourBuildingPath가 없거나 권한 없으면 공란
        }

        // 3) top3 places
        let topPlaces = [];
        try {
          const keysSnap = await get(ref(rtdb, placeKeysPath));
          if (keysSnap.exists()) {
            const keysObj = keysSnap.val() || {};
            const keys = Array.isArray(keysObj) ? keysObj : Object.keys(keysObj);

            const snaps = await Promise.all(
              keys.map((k) => get(ref(rtdb, `${dayPerPlacePath}/${k}/${todayKey}`)))
            );

            const pairs = snaps.map((s, idx) => {
              const k = keys[idx];
              const raw = safeNum(s.val()?.[sumField]);
              const vv = safeNum(valueScale(raw));
              return { key: k, value: vv };
            });

            pairs.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
            topPlaces = pairs.slice(0, topN);
          }
        } catch (e) {
          topPlaces = [];
        }

        if (!mounted) return;

        setState({
          todayKey,
          monthKey,
          todayValue: todayVal,
          monthValue: monthVal,
          deltaDay: todayVal - ydayVal,
          deltaMonth: monthVal - prevMonthVal,
          peakRange,
          topPlaces,
        });
      } catch (e) {
        console.error("[useMaxUsageCard] error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();

    let id = null;
    if (refreshMs && Number(refreshMs) > 0) {
      id = setInterval(run, Number(refreshMs));
    }

    return () => {
      mounted = false;
      if (id) clearInterval(id);
    };
  }, [
    sumField,
    unit,
    valueScale,
    dayBuildingPath,
    monthBuildingPath,
    hourBuildingPath,
    placeKeysPath,
    dayPerPlacePath,
    topN,
    refreshMs,
    todayKey,
    ydayKey,
    monthKey,
    prevMonthKey,
  ]);

  return { ...state, loading, unit };
}
