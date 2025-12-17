// src/hooks/dataPage/elec/Electdata.js
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, query, orderByKey, limitToLast, onValue } from "firebase/database";

function getDateKeyKST(d = new Date()) {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10); // YYYY-MM-DD
}

function toKstMs(dayStr, hhmm) {
  // hhmm: "20:36"
  // KST 기준으로 ms 변환
  return new Date(`${dayStr}T${hhmm}:00+09:00`).getTime();
}

export function ElecTdata({
  basePath = "aggMinuteBuilding",
  metric = "elecAvg",
  minutes = 60,          // ✅ “표시 윈도우” (최근 60분)
  sampleLimit = 180,     // ✅ DB에서 넉넉히 가져올 개수(누락 대비)
  dateKey,               // 특정 날짜 고정하고 싶으면 사용
} = {}) {
  const [rawToday, setRawToday] = useState({});
  const [rawYday, setRawYday] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ 시간이 지나도(데이터 변화 없어도) 1시간 창이 움직이게 tick
  const [tick, setTick] = useState(0);

  const now = Date.now();
  const startMs = now - minutes * 60 * 1000;

  const day = useMemo(() => dateKey ?? getDateKeyKST(new Date()), [dateKey]);
  const startDay = useMemo(() => getDateKeyKST(new Date(startMs)), [startMs]);

  // 오늘 데이터 구독
  useEffect(() => {
    setLoading(true);
    const q = query(ref(rtdb, `${basePath}/${day}`), orderByKey(), limitToLast(sampleLimit));

    const unsub = onValue(
      q,
      (snap) => {
        setRawToday(snap.val() || {});
        setLoading(false);
      },
      (err) => {
        console.error("[RTDB today onValue] error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [basePath, day, sampleLimit]);

  // ✅ 최근 1시간이 “어제”까지 걸치면 어제 데이터도 구독
  useEffect(() => {
    // dateKey를 강제로 준 경우는 보통 하루 단위 확인이니 어제 구독 생략 가능
    if (dateKey) return;

    if (startDay === day) {
      setRawYday({});
      return;
    }

    const q = query(ref(rtdb, `${basePath}/${startDay}`), orderByKey(), limitToLast(sampleLimit));
    const unsub = onValue(
      q,
      (snap) => setRawYday(snap.val() || {}),
      (err) => console.error("[RTDB yday onValue] error:", err)
    );
    return () => unsub();
  }, [basePath, day, startDay, sampleLimit, dateKey]);

  // ✅ tick timer (윈도우 계속 갱신)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000); // 10초마다 갱신
    return () => clearInterval(id);
  }, []);

  // ✅ raw -> (최근 1시간) labels/values 변환
  const { labels, values } = useMemo(() => {
    // tick을 참조해서 10초마다 필터 재실행
    void tick;

    const points = [];

    // 어제(필요 시)
    for (const k of Object.keys(rawYday || {})) {
      const ms = toKstMs(startDay, k);
      if (ms >= startMs && ms <= now) {
        points.push({ ms, label: k, v: Number(rawYday[k]?.[metric] ?? 0) });
      }
    }

    // 오늘
    for (const k of Object.keys(rawToday || {})) {
      const ms = toKstMs(day, k);
      if (ms >= startMs && ms <= now) {
        points.push({ ms, label: k, v: Number(rawToday[k]?.[metric] ?? 0) });
      }
    }

    points.sort((a, b) => a.ms - b.ms);

    return {
      labels: points.map((p) => p.label),
      values: points.map((p) => p.v),
    };
  }, [rawToday, rawYday, metric, day, startDay, startMs, now, tick]);

  // ✅ rawToday 기준 마지막 키(시각) 확인용
const lastKeyToday = useMemo(() => {
  const ks = Object.keys(rawToday || {}).sort();
  return ks.length ? ks[ks.length - 1] : null;
}, [rawToday]);

return { labels, values, loading, day, lastKeyToday };
}
