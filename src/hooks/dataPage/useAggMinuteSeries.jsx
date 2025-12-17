import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, query, orderByKey, limitToLast, onValue } from "firebase/database";

function getSeoulDateKey(d = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(d); // YYYY-MM-DD
}
function toSeoulMs(dayKey, hhmm) {
  return new Date(`${dayKey}T${hhmm}:00+09:00`).getTime();
}

export function useAggMinuteSeries({
  basePath = "aggMinuteBuilding",
  metricField = "elecAvg",
  minutes = 60,          // 최근 60분
  sampleLimit = 240,     // 넉넉히 가져오기
} = {}) {
  const [rawToday, setRawToday] = useState({});
  const [rawYday, setRawYday] = useState({});
  const [loading, setLoading] = useState(true);

  // “시간 창”이 데이터 변동 없어도 움직이게
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  // ✅ 분 단위로 정렬된 now
  const nowMs = Math.floor(Date.now() / 60000) * 60000;
  const startMs = nowMs - minutes * 60 * 1000;

  const todayKey = useMemo(() => getSeoulDateKey(new Date(nowMs)), [nowMs]);
  const startDayKey = useMemo(() => getSeoulDateKey(new Date(startMs)), [startMs]);

  // 오늘 구독
  useEffect(() => {
    setLoading(true);
    const q = query(
      ref(rtdb, `${basePath}/${todayKey}`),
      orderByKey(),
      limitToLast(sampleLimit)
    );

    const unsub = onValue(
      q,
      (snap) => {
        setRawToday(snap.val() || {});
        setLoading(false);
      },
      (err) => {
        console.error("[useAggMinuteSeries today] error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [basePath, todayKey, sampleLimit]);

  // 자정 걸칠 때만 어제 구독
  useEffect(() => {
    if (startDayKey === todayKey) {
      setRawYday({});
      return;
    }

    const q = query(
      ref(rtdb, `${basePath}/${startDayKey}`),
      orderByKey(),
      limitToLast(sampleLimit)
    );

    const unsub = onValue(
      q,
      (snap) => setRawYday(snap.val() || {}),
      (err) => console.error("[useAggMinuteSeries yday] error:", err)
    );

    return () => unsub();
  }, [basePath, startDayKey, todayKey, sampleLimit]);

  const { labels, values, lastKey } = useMemo(() => {
    void tick;

    const pts = [];

    for (const k of Object.keys(rawYday || {})) {
      const ms = toSeoulMs(startDayKey, k);
      if (ms >= startMs && ms <= nowMs) {
        pts.push({ ms, label: k, v: Number(rawYday[k]?.[metricField] ?? 0) });
      }
    }

    for (const k of Object.keys(rawToday || {})) {
      const ms = toSeoulMs(todayKey, k);
      if (ms >= startMs && ms <= nowMs) {
        pts.push({ ms, label: k, v: Number(rawToday[k]?.[metricField] ?? 0) });
      }
    }

    pts.sort((a, b) => a.ms - b.ms);

    const last = pts.length ? pts[pts.length - 1].label : null;

    return {
      labels: pts.map((p) => p.label),
      values: pts.map((p) => p.v),
      lastKey: last,
    };
  }, [rawToday, rawYday, metricField, startMs, nowMs, todayKey, startDayKey, tick]);

  return { labels, values, loading, todayKey, lastKey };
}
