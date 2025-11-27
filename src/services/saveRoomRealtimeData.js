// src/services/saveRoomRealtimeData.js
import { rtdb } from "../firebase/config";
import {
  ref,
  push,
  get,
  update,
  query,
  orderByChild,
  endAt,
} from "firebase/database";

// 숫자 안전 변환
function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// createdAt(ms) → 키들 생성
function getTimeKeys(ts) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  const dateKey = `${year}-${month}-${day}`; // YYYY-MM-DD
  const hourKey = hour; // HH
  const minuteKey = `${hour}:${minute}`; // HH:mm
  const monthKey = `${year}-${month}`; // YYYY-MM

  return { dateKey, hourKey, minuteKey, monthKey };
}

// 이벤트 카운트 합치기
function mergeEventCounts(prevCounts = {}, eventTypes = [], mainEventType) {
  const next = { ...prevCounts };
  const all = [];

  if (mainEventType) all.push(mainEventType);
  if (Array.isArray(eventTypes)) all.push(...eventTypes);

  all.forEach((t) => {
    if (!t) return;
    next[t] = (next[t] || 0) + 1;
  });

  return next;
}

/**
 * 🔹 층 기준 실시간 데이터 저장 + 집계 업데이트
 *  - raw:      realtime/{floor}/autoId
 *  - minute:   aggMinute/{floor}/{dateKey}/{minuteKey}
 *  - hour:     aggHour/{floor}/{dateKey}/{hourKey}
 *  - day:      aggDay/{floor}/{dateKey}
 *  - month:    aggMonth/{floor}/{monthKey}
 */
export async function saveRoomRealtimeData(args) {
  const {
    floor,
    elec = 0,
    water = 0,
    gas = 0,
    temp = 0,
    mainEventType = "normal",
    eventTypes = [],
    mainEventExtendedCount = 0,
    isAlarm = false,
    mode = "demo",
    createdAt,
    speed = 1,
    activeRooms = null,
    roomsPerFloor = null,
  } = args || {};

  if (!floor) {
    console.warn("saveRoomRealtimeData: floor 값이 없습니다.", args);
    return;
  }

  const ts = typeof createdAt === "number" ? createdAt : Date.now();

  // 🔹 1) 초단위 raw 저장 (realtime/{floor})
  const baseRef = ref(rtdb, `realtime/${floor}`);

  const payload = {
    elec,
    water,
    gas,
    temp,
    mainEventType,
    eventTypes,
    mainEventExtendedCount,
    isAlarm: !!isAlarm,
    mode,
    createdAt: ts,
    speed,
  };

  if (activeRooms != null) payload.activeRooms = activeRooms;
  if (roomsPerFloor != null) payload.roomsPerFloor = roomsPerFloor;

  await push(baseRef, payload);

  // 🔹 2) 집계용 키 계산
  const { dateKey, hourKey, minuteKey, monthKey } = getTimeKeys(ts);

  // 🔹 3) 분/시/일/월 집계 업데이트 (병렬 실행)
  await Promise.all([
    updateMinuteAggregate({
      floor,
      dateKey,
      minuteKey,
      elec,
      water,
      gas,
      temp,
      eventTypes,
      mainEventType,
      isAlarm,
    }),
    updateHourAggregate({
      floor,
      dateKey,
      hourKey,
      elec,
      water,
      gas,
      temp,
      eventTypes,
      mainEventType,
      isAlarm,
    }),
    updateDayAggregate({
      floor,
      dateKey,
      elec,
      water,
      gas,
      temp,
      eventTypes,
      mainEventType,
      isAlarm,
    }),
    updateMonthAggregate({
      floor,
      monthKey,
      elec,
      water,
      gas,
      temp,
      eventTypes,
      mainEventType,
      isAlarm,
    }),
  ]);
}

// -------------------- 집계 업데이트 helpers --------------------

async function updateMinuteAggregate({
  floor,
  dateKey,
  minuteKey,
  elec,
  water,
  gas,
  temp,
  eventTypes,
  mainEventType,
  isAlarm,
}) {
  const aggRef = ref(rtdb, `aggMinute/${floor}/${dateKey}/${minuteKey}`);
  const snap = await get(aggRef);
  const prev = snap.exists() ? snap.val() : {};

  const prevCount = num(prev.count);
  const count = prevCount + 1;

  const elecSum = num(prev.elecSum) + num(elec);
  const waterSum = num(prev.waterSum) + num(water);
  const gasSum = num(prev.gasSum) + num(gas);
  const tempSum = num(prev.tempSum) + num(temp);

  const eventCounts = mergeEventCounts(
    prev.eventCounts,
    eventTypes,
    mainEventType
  );
  const alarmCount = num(prev.alarmCount) + (isAlarm ? 1 : 0);

  const next = {
    count,
    elecSum,
    waterSum,
    gasSum,
    tempSum,
    elecAvg: elecSum / count,
    waterAvg: waterSum / count,
    gasAvg: gasSum / count,
    tempAvg: tempSum / count,
    eventCounts,
    alarmCount,
  };

  await update(aggRef, next);
}

async function updateHourAggregate({
  floor,
  dateKey,
  hourKey,
  elec,
  water,
  gas,
  temp,
  eventTypes,
  mainEventType,
  isAlarm,
}) {
  const aggRef = ref(rtdb, `aggHour/${floor}/${dateKey}/${hourKey}`);
  const snap = await get(aggRef);
  const prev = snap.exists() ? snap.val() : {};

  const prevCount = num(prev.count);
  const count = prevCount + 1;

  const elecSum = num(prev.elecSum) + num(elec);
  const waterSum = num(prev.waterSum) + num(water);
  const gasSum = num(prev.gasSum) + num(gas);
  const tempSum = num(prev.tempSum) + num(temp);

  const eventCounts = mergeEventCounts(
    prev.eventCounts,
    eventTypes,
    mainEventType
  );
  const alarmCount = num(prev.alarmCount) + (isAlarm ? 1 : 0);

  const next = {
    count,
    elecSum,
    waterSum,
    gasSum,
    tempSum,
    elecAvg: elecSum / count,
    waterAvg: waterSum / count,
    gasAvg: gasSum / count,
    tempAvg: tempSum / count,
    eventCounts,
    alarmCount,
  };

  await update(aggRef, next);
}

async function updateDayAggregate({
  floor,
  dateKey,
  elec,
  water,
  gas,
  temp,
  eventTypes,
  mainEventType,
  isAlarm,
}) {
  const aggRef = ref(rtdb, `aggDay/${floor}/${dateKey}`);
  const snap = await get(aggRef);
  const prev = snap.exists() ? snap.val() : {};

  const prevCount = num(prev.count);
  const count = prevCount + 1;

  const elecSum = num(prev.elecSum) + num(elec);
  const waterSum = num(prev.waterSum) + num(water);
  const gasSum = num(prev.gasSum) + num(gas);
  const tempSum = num(prev.tempSum) + num(temp);

  const eventCounts = mergeEventCounts(
    prev.eventCounts,
    eventTypes,
    mainEventType
  );
  const alarmCount = num(prev.alarmCount) + (isAlarm ? 1 : 0);

  const next = {
    count,
    elecSum,
    waterSum,
    gasSum,
    tempSum,
    // 일별 그래프에서는 tempAvg, elecSum/waterSum/gasSum만 사용
    tempAvg: tempSum / count,
    eventCounts,
    alarmCount,
  };

  await update(aggRef, next);
}

async function updateMonthAggregate({
  floor,
  monthKey,
  elec,
  water,
  gas,
  temp,
  eventTypes,
  mainEventType,
  isAlarm,
}) {
  const aggRef = ref(rtdb, `aggMonth/${floor}/${monthKey}`);
  const snap = await get(aggRef);
  const prev = snap.exists() ? snap.val() : {};

  const prevCount = num(prev.count);
  const count = prevCount + 1;

  const elecSum = num(prev.elecSum) + num(elec);
  const waterSum = num(prev.waterSum) + num(water);
  const gasSum = num(prev.gasSum) + num(gas);
  const tempSum = num(prev.tempSum) + num(temp);

  const eventCounts = mergeEventCounts(
    prev.eventCounts,
    eventTypes,
    mainEventType
  );
  const alarmCount = num(prev.alarmCount) + (isAlarm ? 1 : 0);

  const next = {
    count,
    elecSum,
    waterSum,
    gasSum,
    tempSum,
    tempAvg: tempSum / count,
    eventCounts,
    alarmCount,
  };

  await update(aggRef, next);
}

// -------------------- 오래된 데이터 정리 --------------------

/**
 * 🔹 초단위 raw 데이터 정리
 *  - realtime/{floor} 에서 createdAt 기준으로 오래된 것 삭제
 *  - nowTs: "현재 기준 시각" (ms) — 시뮬레이션 시간과 맞추고 싶을 때 넘겨 사용
 */
export async function cleanupOldRealtimeSeconds({
  floor,
  keepSeconds = 60 * 60, // default: 1시간
  nowTs = Date.now(),
}) {
  if (!floor) return;

  const cutoff = nowTs - keepSeconds * 1000;

  const path = `realtime/${floor}`;
  const baseRef = ref(rtdb, path);
  const q = query(baseRef, orderByChild("createdAt"), endAt(cutoff));

  const snap = await get(q);
  if (!snap.exists()) return;

  const updates = {};
  snap.forEach((child) => {
    updates[`${path}/${child.key}`] = null;
  });

  if (Object.keys(updates).length === 0) return;

  await update(ref(rtdb), updates);
}

/**
 * 🔹 분단위 집계 정리
 *  - aggMinute/{floor}/{dateKey} 중 오래된 dateKey 제거
 *  - nowTs: "현재 기준 시각" (ms)
 */
export async function cleanupOldMinuteAggregates({
  floor,
  keepDays = 30,
  nowTs = Date.now(),
}) {
  if (!floor) return;

  const cutoffTs = nowTs - keepDays * 24 * 60 * 60 * 1000;
  const aggRef = ref(rtdb, `aggMinute/${floor}`);
  const snap = await get(aggRef);

  if (!snap.exists()) return;

  const updates = {};

  snap.forEach((daySnap) => {
    const dateKey = daySnap.key; // YYYY-MM-DD
    const [y, m, d] = dateKey.split("-").map(Number);
    const dayTs = new Date(y, m - 1, d).getTime();
    if (dayTs < cutoffTs) {
      updates[`aggMinute/${floor}/${dateKey}`] = null;
    }
  });

  if (Object.keys(updates).length === 0) return;

  await update(ref(rtdb), updates);
}

/**
 * 🔹 시단위 집계 정리
 *  - aggHour/{floor}/{dateKey} 중 오래된 dateKey 제거
 *  - nowTs: "현재 기준 시각" (ms)
 */
export async function cleanupOldHourAggregates({
  floor,
  keepDays = 365,
  nowTs = Date.now(),
}) {
  if (!floor) return;

  const cutoffTs = nowTs - keepDays * 24 * 60 * 60 * 1000;
  const aggRef = ref(rtdb, `aggHour/${floor}`);
  const snap = await get(aggRef);

  if (!snap.exists()) return;

  const updates = {};

  snap.forEach((daySnap) => {
    const dateKey = daySnap.key; // YYYY-MM-DD
    const [y, m, d] = dateKey.split("-").map(Number);
    const dayTs = new Date(y, m - 1, d).getTime();
    if (dayTs < cutoffTs) {
      updates[`aggHour/${floor}/${dateKey}`] = null;
    }
  });

  if (Object.keys(updates).length === 0) return;

  await update(ref(rtdb), updates);
}
