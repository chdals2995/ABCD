// src/services/saveRoomRealtimeData.jsx
import { rtdb } from "../firebase/config";
import {
  ref,
  push,
  runTransaction,
  query,
  orderByChild,
  endAt,
  limitToFirst,
  get,
  remove,
  orderByKey,
  startAt,
} from "firebase/database";

// 🔹 초단위 raw 데이터 경로
const SECOND_RAW_PATH = (floor, room) => `realtime/${floor}/${room}`;

// 🔹 집계 데이터 경로들
const MINUTE_AGG_PATH = (floor, room, dateKey, minuteKey) =>
  `aggMinute/${floor}/${room}/${dateKey}/${minuteKey}`;

const HOUR_AGG_PATH = (floor, room, dateKey, hourKey) =>
  `aggHour/${floor}/${room}/${dateKey}/${hourKey}`;

const DAY_AGG_PATH = (floor, room, dateKey) =>
  `aggDay/${floor}/${room}/${dateKey}`;

const MONTH_AGG_PATH = (floor, room, monthKey) =>
  `aggMonth/${floor}/${room}/${monthKey}`;

// 🔹 초단위 raw 데이터 보관 기간(초) – 기본 1시간
const KEEP_SECONDS = 60 * 60;
const CLEANUP_BATCH_SIZE = 500;

// ---------- 날짜/시간 키 유틸 ----------

// YYYY-MM-DD
function formatDateKey(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// YYYY-MM
function formatMonthKey(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// HH:mm
function formatMinuteKey(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// HH
function formatHourKey(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  return hh;
}

// ---------- 공통 집계 함수 ----------

/**
 * path에 대해 (sum, count, avg + 이벤트 집계) 업데이트
 *  - seconds → minute/hour/day/month 집계에 모두 같은 방식으로 사용
 */
async function updateAggregate(
  path,
  { elec, water, gas, temp, mainEventType, eventTypes, isAlarm }
) {
  const aggRef = ref(rtdb, path);

  await runTransaction(aggRef, (current) => {
    const e = Number(elec) || 0;
    const w = Number(water) || 0;
    const g = Number(gas) || 0;
    const t = Number(temp) || 0;

    // ▶ 이벤트 카운트용 준비
    if (current == null) {
      const eventCounts = {};
      if (mainEventType) {
        eventCounts[mainEventType] = 1;
      }
      if (Array.isArray(eventTypes)) {
        for (const et of eventTypes) {
          if (!et) continue;
          eventCounts[et] = (eventCounts[et] || 0) + 1;
        }
      }
      const alarmCount = isAlarm ? 1 : 0;

      const count = 1;
      const elecSum = e;
      const waterSum = w;
      const gasSum = g;
      const tempSum = t;

      return {
        count,
        elecSum,
        waterSum,
        gasSum,
        tempSum,
        elecAvg: elecSum / count,
        waterAvg: waterSum / count,
        gasAvg: gasSum / count,
        tempAvg: tempSum / count,
        updatedAt: Date.now(),
        eventCounts,
        alarmCount,
      };
    }

    // 기존 값 + 새 샘플 합치기
    const count = (current.count || 0) + 1;
    const elecSum = (current.elecSum || 0) + e;
    const waterSum = (current.waterSum || 0) + w;
    const gasSum = (current.gasSum || 0) + g;
    const tempSum = (current.tempSum || 0) + t;

    const eventCounts = { ...(current.eventCounts || {}) };
    if (mainEventType) {
      eventCounts[mainEventType] = (eventCounts[mainEventType] || 0) + 1;
    }
    if (Array.isArray(eventTypes)) {
      for (const et of eventTypes) {
        if (!et) continue;
        eventCounts[et] = (eventCounts[et] || 0) + 1;
      }
    }
    const alarmCount = (current.alarmCount || 0) + (isAlarm ? 1 : 0);

    return {
      ...current,
      count,
      elecSum,
      waterSum,
      gasSum,
      tempSum,
      elecAvg: elecSum / count,
      waterAvg: waterSum / count,
      gasAvg: gasSum / count,
      tempAvg: tempSum / count,
      updatedAt: Date.now(),
      eventCounts,
      alarmCount,
    };
  });
}

// ---------- 초단위 raw 저장 + 다단계 집계 ----------

/**
 * 초단위 데이터 저장 + 분/시/일/월 평균으로 가공해서 저장
 *
 * 초단위 raw:  realtime/{floor}/{room}
 * 분 평균:    aggMinute/{floor}/{room}/{YYYY-MM-DD}/{HH:mm}
 * 시 평균:    aggHour/{floor}/{room}/{YYYY-MM-DD}/{HH}
 * 일 평균:    aggDay/{floor}/{room}/{YYYY-MM-DD}
 * 월 평균:    aggMonth/{floor}/{room}/{YYYY-MM}
 */
export async function saveRoomRealtimeData({
  floor,
  room,
  elec,
  water,
  gas,
  temp,
  createdAt,
  mainEventType,
  eventTypes,
  isAlarm,
  ...rest
}) {
  const ts = createdAt ?? Date.now();

  // 1) 초단위 raw 저장
  const rawPath = SECOND_RAW_PATH(floor, room);
  const rawRef = ref(rtdb, rawPath);

  const payload = {
    floor,
    room,
    elec,
    water,
    gas,
    temp,
    mainEventType: mainEventType ?? null,
    eventTypes: Array.isArray(eventTypes) ? eventTypes : [],
    isAlarm: !!isAlarm,
    createdAt: ts,
    ...rest,
  };

  await push(rawRef, payload);

  // 2) 키 계산
  const dateKey = formatDateKey(ts); // 2025-11-19
  const monthKey = formatMonthKey(ts); // 2025-11
  const minuteKey = formatMinuteKey(ts); // 10:30
  const hourKey = formatHourKey(ts); // "10"

  const value = {
    elec,
    water,
    gas,
    temp,
    mainEventType,
    eventTypes,
    isAlarm,
  };

  // 3) 초단위 데이터로 바로 각 단계 집계 업데이트
  const minutePath = MINUTE_AGG_PATH(floor, room, dateKey, minuteKey);
  const hourPath = HOUR_AGG_PATH(floor, room, dateKey, hourKey);
  const dayPath = DAY_AGG_PATH(floor, room, dateKey);
  const monthPath = MONTH_AGG_PATH(floor, room, monthKey);

  await Promise.all([
    updateAggregate(minutePath, value),
    updateAggregate(hourPath, value),
    updateAggregate(dayPath, value),
    updateAggregate(monthPath, value),
  ]);
}

// ---------- 오래된 초단위(raw) 데이터 삭제 ----------

/**
 * 초단위 raw 데이터 정리
 *  - keepSeconds 이전(createdAt <= now - keepSeconds*1000) 데이터 삭제
 *
 * 예) keepSeconds = 3600 이면 "1시간 이전" 초단위 데이터는 지움
 */
export async function cleanupOldRealtimeSeconds({
  floor,
  room,
  keepSeconds = KEEP_SECONDS,
  batchSize = CLEANUP_BATCH_SIZE,
} = {}) {
  const nowTs = Date.now();
  const cutoffTs = nowTs - keepSeconds * 1000;

  const rawPath = SECOND_RAW_PATH(floor, room);
  const rawRef = ref(rtdb, rawPath);

  const q = query(
    rawRef,
    orderByChild("createdAt"),
    endAt(cutoffTs),
    limitToFirst(batchSize)
  );

  const snap = await get(q);
  if (!snap.exists()) {
    return;
  }

  const promises = [];
  snap.forEach((child) => {
    promises.push(remove(child.ref));
  });

  await Promise.all(promises);
  console.log(
    `cleanupOldRealtimeSeconds: ${floor} ${room} 에서 ${promises.length}개 삭제`
  );
}

// ---------- 분단위 집계 오래된 것 삭제 (예: 30일 이전) ----------

export async function cleanupOldMinuteAggregates({
  floor,
  room,
  keepDays = 30,
} = {}) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now.getTime() - keepDays * 24 * 3600 * 1000);
  const cutoffKey = formatDateKey(cutoff.getTime()); // YYYY-MM-DD

  const rootRef = ref(rtdb, `aggMinute/${floor}/${room}`);
  // 날짜키(YYYY-MM-DD) 기준으로 cutoff 이전까지 모두 삭제
  const q = query(rootRef, orderByKey(), endAt(cutoffKey));

  const snap = await get(q);
  if (!snap.exists()) return;

  const promises = [];
  snap.forEach((daySnap) => {
    // daySnap.key <= cutoffKey 인 날짜 전체 삭제
    if (daySnap.key <= cutoffKey) {
      promises.push(remove(daySnap.ref));
    }
  });

  await Promise.all(promises);
  console.log(
    `cleanupOldMinuteAggregates: ${floor} ${room} 에서 ${promises.length}개 날짜 삭제`
  );
}

// ---------- 시간단위 집계 오래된 것 삭제 (예: 1년 이전) ----------

export async function cleanupOldHourAggregates({
  floor,
  room,
  keepDays = 365,
} = {}) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const cutoff = new Date(now.getTime() - keepDays * 24 * 3600 * 1000);
  const cutoffKey = formatDateKey(cutoff.getTime()); // YYYY-MM-DD

  const rootRef = ref(rtdb, `aggHour/${floor}/${room}`);
  const q = query(rootRef, orderByKey(), endAt(cutoffKey));

  const snap = await get(q);
  if (!snap.exists()) return;

  const promises = [];
  snap.forEach((daySnap) => {
    if (daySnap.key <= cutoffKey) {
      promises.push(remove(daySnap.ref));
    }
  });

  await Promise.all(promises);
  console.log(
    `cleanupOldHourAggregates: ${floor} ${room} 에서 ${promises.length}개 날짜 삭제`
  );
}
