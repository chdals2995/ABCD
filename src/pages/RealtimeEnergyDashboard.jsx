// src/pages/RealtimeEnergyDashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "chart.js/auto";
import { Line, Bar } from "react-chartjs-2";
import { rtdb } from "../firebase/config";
import {
  ref,
  query,
  orderByChild,
  startAt,
  onValue,
  get,
  set,
} from "firebase/database";

import {
  deleteRealtimeRoot,
  deleteAllEnergyData,
} from "../services/DeleteRealtimeRoot";
import FakeRealtimeGenerator from "../components/FakeRealtimeGenerator";

// 🔧 RTDB 경로 기본값 (층 기준)
const DEFAULT_FLOOR = "1F";
// 초단위 raw RTDB 경로 (층 단위)
const RTDB_SECONDS_PATH = (floor) => `realtime/${floor}`;

// 🔧 시뮬레이션 설정이 저장될 RTDB 경로
const SIM_CONFIG_PATH = "simConfig/default";

// 🔧 전체층수 + 지하층수 → ["B2", "B1", "1F", "2F", ...] 생성
function buildFloorIds(totalFloors, basementFloors) {
  const t = Number(totalFloors) || 0;
  const b = Number(basementFloors) || 0;
  if (t <= 0) return [];
  const above = Math.max(0, t - b);
  const ids = [];

  // 지하: B2, B1 순서로
  for (let i = b; i >= 1; i--) {
    ids.push(`B${i}`);
  }

  // 지상: 1F, 2F, ...
  for (let f = 1; f <= above; f++) {
    ids.push(`${f}F`);
  }

  return ids;
}

// 🔹 초단위 raw 를 subscribe 할 때 가져올 최대 히스토리 (초 단위)
const RAW_HISTORY_SECONDS = 20 * 60; // 최대 20분치

// 🔹 집계 차트에서 화면에 보여줄 최대 막대 개수
const MAX_DAILY_BARS = 7; // 최근 7일 (또는 슬라이더로 이동)
const MAX_WEEKLY_BARS = 12; // 최근 12주
const MAX_MONTHLY_BARS = 12; // 최근 12개월

// 실시간 구간 프리셋 (초 단위)
const REALTIME_WINDOW_PRESETS = [
  { id: "60s", label: "60초", seconds: 60 },
  { id: "5m", label: "5분", seconds: 5 * 60 },
  { id: "10m", label: "10분", seconds: 10 * 60 },
  { id: "30m", label: "30분", seconds: 30 * 60 },
  { id: "1h", label: "1시간", seconds: 60 * 60 },
  { id: "6h", label: "6시간", seconds: 6 * 60 * 60 },
  { id: "12h", label: "12시간", seconds: 12 * 60 * 60 },
  { id: "24h", label: "24시간", seconds: 24 * 60 * 60 },
];

// 🔹 초단위/분단위/시간단위 구분 함수
//  - 60초 / 5분 / 10분             → "second"
//  - 30분 / 1시간                  → "minute"
//  - 6시간 / 12시간 / 24시간 이상  → "hour"
function getRealtimeSourceType(windowSeconds) {
  if (windowSeconds <= 10 * 60) return "second";
  if (windowSeconds <= 60 * 60) return "minute";
  return "hour";
}

// 이벤트 타입 → 한글 라벨
const EVENT_LABELS = {
  normal: "정상",
  overtime: "야근",
  fire: "화재",
  conference: "회의",
  training: "교육",
  tour: "투어/견학",
  equipment_test_boiler: "보일러 점검",
  ventilation_boost: "환기 강화",
  window_open: "창문 개방",
  equipment_off: "설비 OFF",
  light_left_on: "조명 미소등",
  water_leak: "누수",
  gas_leak: "가스 누출",
  hvac_fault: "냉난방 설비 이상",
  power_issue: "전력 이상",
  cleaning: "청소",
};

// 공통 차트 옵션 (라인 공통)
const commonLineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { maxTicksLimit: 8 },
    },
    y: {
      beginAtZero: false,
    },
  },
};

// 공통 차트 옵션 (막대 공통)
const commonBarOptions = {
  ...commonLineOptions,
  animation: false, // 집계 차트는 굳이 애니메이션 안 써도 됨 (성능 개선)
};

function buildLineData(labels, values, label) {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };
}

function buildBarData(labels, values, label) {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
}

// YYYY-MM-DD
function formatDateKey(ts) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 주 시작 날짜(월요일 기준)
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0(일) ~ 6(토)
  const diff = day === 0 ? -6 : 1 - day; // 월요일 기준
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// HH:MM:SS
function formatTimeLabel(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// HH:MM (분 단위 축용)
function formatTimeLabelMinute(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// MM/DD HH시 (시간 단위 축용)
function formatTimeLabelHour(ts) {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  return `${month}/${day} ${hh}시`;
}

// MM/DD
function formatDayLabel(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${month}/${day}`;
}

// 주별 라벨 (주 시작일 기준)
function formatWeekLabel(weekKey) {
  const [, month, day] = weekKey.split("-");
  return `${month}/${day} 주`;
}

// YYYY.MM
function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${year}.${month}`;
}

// YYYY-MM-DD + HH:mm → timestamp
function buildTimestampFromDayMinute(dateKey, minuteKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hh, mm] = minuteKey.split(":").map(Number);
  return new Date(year, month - 1, day, hh, mm, 0, 0).getTime();
}

// YYYY-MM-DD + HH → timestamp
function buildTimestampFromDayHour(dateKey, hourKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const hh = Number(hourKey);
  return new Date(year, month - 1, day, hh, 0, 0, 0).getTime();
}

// 주별 집계 (일별 집계 → 주별 합계/평균)
function buildWeeklyStats(dailyStats) {
  const map = new Map();

  dailyStats.forEach((d) => {
    const [year, month, day] = d.dateKey.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const weekStartDate = getWeekStartDate(dateObj);
    const weekKey = formatDateKey(weekStartDate.getTime());

    const cur = map.get(weekKey) || {
      elec: 0,
      water: 0,
      gas: 0,
      tempSum: 0,
      dayCount: 0,
    };

    map.set(weekKey, {
      elec: cur.elec + d.elec,
      water: cur.water + d.water,
      gas: cur.gas + d.gas,
      tempSum: cur.tempSum + d.temp,
      dayCount: cur.dayCount + 1,
    });
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([weekKey, v]) => ({
      weekKey,
      elec: v.elec,
      water: v.water,
      gas: v.gas,
      temp: v.dayCount > 0 ? v.tempSum / v.dayCount : 0,
    }));
}

// 🔹 타임스탬프 기반 히스토리 정보
function buildHistoryInfo(list, tsKey) {
  const withTs = list.filter((item) => Number.isFinite(item[tsKey]));
  if (!withTs.length) return null;
  const firstTs = withTs[0][tsKey];
  const lastTs = withTs[withTs.length - 1][tsKey];
  const totalSec = (lastTs - firstTs) / 1000;
  return { firstTs, lastTs, totalSec };
}

// 🔹 히스토리에서 windowSeconds 만큼, pos(0~1)에 해당하는 구간만 슬라이싱
function buildTimeWindow(list, historyInfo, windowSeconds, pos, tsKey) {
  if (!historyInfo) return [];
  const withTs = list.filter((item) => Number.isFinite(item[tsKey]));
  if (!withTs.length) return [];

  const { firstTs, lastTs, totalSec } = historyInfo;

  // 히스토리가 윈도우 길이보다 짧으면 전체 사용
  if (totalSec <= windowSeconds) {
    return withTs;
  }

  const maxStartTs = lastTs - windowSeconds * 1000;
  const clampedPos = Math.min(1, Math.max(0, pos ?? 1)); // 0=과거, 1=최근
  const startTs = firstTs + (maxStartTs - firstTs) * clampedPos;
  const endTs = startTs + windowSeconds * 1000;

  return withTs.filter((row) => row[tsKey] >= startTs && row[tsKey] <= endTs);
}

// 🔹 일/주/월 배열에서 windowSize 개를 pos(0~1)에 맞춰 잘라내기
function sliceWindowByPos(list, windowSize, pos) {
  if (!list.length) return [];
  if (list.length <= windowSize) return list;
  const maxStart = list.length - windowSize;
  const clampedPos = Math.min(1, Math.max(0, pos ?? 1));
  const startIndex = Math.round(maxStart * clampedPos);
  return list.slice(startIndex, startIndex + windowSize);
}

export default function RealtimeEnergyDashboard() {
  const [floor, setFloor] = useState(DEFAULT_FLOOR);
  const [tab, setTab] = useState("realtime"); // realtime | daily | weekly | monthly

  // 🔧 시뮬레이션 설정
  const [simSpeed, setSimSpeed] = useState(1);
  const [totalFloors, setTotalFloors] = useState(10);
  const [basementFloors, setBasementFloors] = useState(0);
  const [roomsPerFloor, setRoomsPerFloor] = useState(7);
  const [configLoaded, setConfigLoaded] = useState(false);

  // ✅ 실시간 구간 선택 (초 단위) – 기본 60초
  const [realtimeWindowSeconds, setRealtimeWindowSeconds] = useState(60);

  // 🔹 실시간 타임 슬라이더 위치 (0=가장 과거, 1=가장 최근)
  const [realtimeWindowPos, setRealtimeWindowPos] = useState(1);

  // 🔹 일/주/월 집계용 슬라이더 위치
  const [dailyWindowPos, setDailyWindowPos] = useState(1);
  const [weeklyWindowPos, setWeeklyWindowPos] = useState(1);
  const [monthlyWindowPos, setMonthlyWindowPos] = useState(1);

  // 🔹 초단위 raw 데이터
  const [rawData, setRawData] = useState([]);

  // 🔹 분 / 시 / 일 / 월 집계 데이터
  const [minuteAgg, setMinuteAgg] = useState([]);
  const [hourAgg, setHourAgg] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  const weeklyStats = useMemo(() => buildWeeklyStats(dailyStats), [dailyStats]);

  const mountedAtRef = useRef(Date.now());

  // ✅ 현재 선택된 구간이 초/분/시간 중 어떤 단위인지
  const realtimeSourceType = useMemo(
    () => getRealtimeSourceType(realtimeWindowSeconds),
    [realtimeWindowSeconds]
  );

  // 🔧 RTDB에서 시뮬레이션 설정 불러오기
  useEffect(() => {
    async function loadConfig() {
      try {
        const cfgRef = ref(rtdb, SIM_CONFIG_PATH);
        const snap = await get(cfgRef);
        if (snap.exists()) {
          const cfg = snap.val();
          if (typeof cfg.speed === "number") setSimSpeed(cfg.speed);
          if (typeof cfg.totalFloors === "number")
            setTotalFloors(cfg.totalFloors);
          if (typeof cfg.basementFloors === "number")
            setBasementFloors(cfg.basementFloors);
          if (typeof cfg.roomsPerFloor === "number")
            setRoomsPerFloor(cfg.roomsPerFloor);
          if (typeof cfg.defaultFloorId === "string")
            setFloor(cfg.defaultFloorId);
        }
      } catch (err) {
        console.error("시뮬레이션 설정 불러오기 실패:", err);
      } finally {
        setConfigLoaded(true);
      }
    }
    loadConfig();
  }, []);

  const floorIds = useMemo(
    () => buildFloorIds(totalFloors, basementFloors),
    [totalFloors, basementFloors]
  );

  // 설정 로드 후 현재 floor가 리스트에 없으면 첫 층으로 맞추기
  useEffect(() => {
    if (!configLoaded) return;
    if (!floorIds.length) return;
    if (!floorIds.includes(floor)) {
      setFloor(floorIds[0]);
    }
  }, [configLoaded, floorIds, floor]);

  // 실시간 구간/층/단위(sourceType)가 바뀔 때마다 실시간 슬라이더는 "최근"으로 리셋
  useEffect(() => {
    setRealtimeWindowPos(1);
  }, [realtimeWindowSeconds, floor, realtimeSourceType]);

  // 일/주/월 데이터 길이가 바뀌면 각각 최신으로 리셋
  useEffect(() => {
    setDailyWindowPos(1);
  }, [dailyStats.length]);

  useEffect(() => {
    setWeeklyWindowPos(1);
  }, [weeklyStats.length]);

  useEffect(() => {
    setMonthlyWindowPos(1);
  }, [monthlyStats.length]);

  async function handleSaveSimConfig() {
    const t = Number(totalFloors) || 0;
    const b = Number(basementFloors) || 0;
    const r = Number(roomsPerFloor) || 0;
    const s = Number(simSpeed) || 1;

    if (t <= 0) {
      alert("전체 층수는 1 이상이어야 합니다.");
      return;
    }
    if (b < 0) {
      alert("지하 층수는 0 이상이어야 합니다.");
      return;
    }
    if (b > t) {
      alert("지하 층수가 전체 층수보다 클 수 없습니다.");
      return;
    }
    if (r <= 0) {
      alert("층당 방 개수는 1 이상이어야 합니다.");
      return;
    }
    if (s <= 0) {
      alert("배속은 1 이상이어야 합니다.");
      return;
    }

    try {
      const cfgRef = ref(rtdb, SIM_CONFIG_PATH);
      await set(cfgRef, {
        speed: s,
        totalFloors: t,
        basementFloors: b,
        roomsPerFloor: r,
        defaultFloorId: floor,
        updatedAt: Date.now(),
      });
      alert("시뮬레이션 설정을 저장했습니다.");
    } catch (err) {
      console.error("시뮬레이션 설정 저장 실패:", err);
      alert("설정 저장에 실패했습니다. 콘솔을 확인해주세요.");
    }
  }

  // 🔥 realtime 전체 삭제 버튼 핸들러
  async function handleDeleteRealtime() {
    const ok = window.confirm(
      "모든 층의 realtime 데이터(realtime/*)를 삭제합니다. 계속할까요?"
    );
    if (!ok) return;

    try {
      await deleteRealtimeRoot();

      // 바로 화면에서도 비워주기
      setRawData([]);
      setMinuteAgg([]);
      setHourAgg([]);
      setDailyStats([]);
      setMonthlyStats([]);

      alert("realtime 데이터가 삭제되었습니다.");
    } catch (err) {
      console.error("realtime 삭제 중 오류:", err);
      alert("삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  }

  // 🔥 realtime + 집계 전체 삭제 버튼 핸들러
  async function handleDeleteAll() {
    const ok = window.confirm(
      "realtime + 집계(분/시/일/월) 데이터를 모두 삭제합니다. 계속할까요?"
    );
    if (!ok) return;

    try {
      await deleteAllEnergyData();

      // 구독이 있어서 곧 비워지긴 하지만, 바로 UI 비워주면 더 좋음
      setRawData([]);
      setMinuteAgg([]);
      setHourAgg([]);
      setDailyStats([]);
      setMonthlyStats([]);

      alert("에너지 관련 전체 데이터가 삭제되었습니다.");
    } catch (err) {
      console.error("전체 데이터 삭제 중 오류:", err);
      alert("삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  }

  // 1) 초단위 raw 구독 (realtime/{floor})
  useEffect(() => {
    const fromTimestamp = mountedAtRef.current - RAW_HISTORY_SECONDS * 1000;

    const path = RTDB_SECONDS_PATH(floor);
    const floorRef = ref(rtdb, path);

    const q = query(
      floorRef,
      orderByChild("createdAt"),
      startAt(fromTimestamp)
    );

    const unsubscribe = onValue(
      q,
      (snap) => {
        if (!snap.exists()) {
          setRawData([]);
          return;
        }
        const list = [];
        snap.forEach((child) => {
          const val = child.val();
          list.push({
            id: child.key,
            ...val,
          });
        });

        list.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return a.createdAt - b.createdAt;
        });

        // 초단위는 어차피 최근 20분만 쓸 거라 최대 1200개 정도만 유지
        const MAX_RAW_POINTS = 1200;
        const trimmed =
          list.length > MAX_RAW_POINTS
            ? list.slice(list.length - MAX_RAW_POINTS)
            : list;

        setRawData(trimmed);
      },
      (err) => {
        console.error("RTDB 실시간 데이터 구독 실패:", err);
      }
    );

    return () => unsubscribe();
  }, [floor]);

  // 2) 분/시/일/월 집계 구독 (aggMinute, aggHour, aggDay, aggMonth) — 층 기준
  useEffect(() => {
    const minuteRef = ref(rtdb, `aggMinute/${floor}`);
    const hourRef = ref(rtdb, `aggHour/${floor}`);
    const dayRef = ref(rtdb, `aggDay/${floor}`);
    const monthRef = ref(rtdb, `aggMonth/${floor}`);

    // 분단위 집계
    const unsubMinute = onValue(
      minuteRef,
      (snap) => {
        if (!snap.exists()) {
          setMinuteAgg([]);
          return;
        }
        const list = [];
        snap.forEach((daySnap) => {
          const dateKey = daySnap.key; // YYYY-MM-DD
          daySnap.forEach((minSnap) => {
            const minuteKey = minSnap.key; // HH:mm
            const v = minSnap.val() || {};
            const ts = buildTimestampFromDayMinute(dateKey, minuteKey);

            list.push({
              dateKey,
              minuteKey,
              ts,
              elec: Number(v.elecAvg ?? v.elecSum ?? 0),
              water: Number(v.waterAvg ?? v.waterSum ?? 0),
              gas: Number(v.gasAvg ?? v.gasSum ?? 0),
              temp: Number(v.tempAvg ?? 0),
              eventCounts: v.eventCounts || {},
              alarmCount: Number(v.alarmCount ?? 0),
            });
          });
        });
        list.sort((a, b) => a.ts - b.ts);

        const MAX_MINUTE_POINTS = 4000;
        const trimmed =
          list.length > MAX_MINUTE_POINTS
            ? list.slice(list.length - MAX_MINUTE_POINTS)
            : list;

        setMinuteAgg(trimmed);
      },
      (err) => {
        console.error("분단위 집계 구독 실패:", err);
        setMinuteAgg([]);
      }
    );

    // 시단위 집계
    const unsubHour = onValue(
      hourRef,
      (snap) => {
        if (!snap.exists()) {
          setHourAgg([]);
          return;
        }
        const list = [];
        snap.forEach((daySnap) => {
          const dateKey = daySnap.key; // YYYY-MM-DD
          daySnap.forEach((hourSnap) => {
            const hourKey = hourSnap.key; // "HH"
            const v = hourSnap.val() || {};
            const ts = buildTimestampFromDayHour(dateKey, hourKey);

            list.push({
              dateKey,
              hourKey,
              ts,
              elec: Number(v.elecAvg ?? v.elecSum ?? 0),
              water: Number(v.waterAvg ?? v.waterSum ?? 0),
              gas: Number(v.gasAvg ?? v.gasSum ?? 0),
              temp: Number(v.tempAvg ?? 0),
              eventCounts: v.eventCounts || {},
              alarmCount: Number(v.alarmCount ?? 0),
            });
          });
        });
        list.sort((a, b) => a.ts - b.ts);

        const MAX_HOUR_POINTS = 2000;
        const trimmed =
          list.length > MAX_HOUR_POINTS
            ? list.slice(list.length - MAX_HOUR_POINTS)
            : list;

        setHourAgg(trimmed);
      },
      (err) => {
        console.error("시단위 집계 구독 실패:", err);
        setHourAgg([]);
      }
    );

    // 일단위 집계
    const unsubDay = onValue(
      dayRef,
      (snap) => {
        if (!snap.exists()) {
          setDailyStats([]);
          return;
        }
        const list = [];
        snap.forEach((child) => {
          const v = child.val() || {};
          list.push({
            dateKey: child.key, // YYYY-MM-DD
            elec: Number(v.elecSum ?? 0),
            water: Number(v.waterSum ?? 0),
            gas: Number(v.gasSum ?? 0),
            temp: Number(v.tempAvg ?? 0),
            eventCounts: v.eventCounts || {},
            alarmCount: Number(v.alarmCount ?? 0),
          });
        });
        list.sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));

        const MAX_DAYS = 365;
        const trimmed =
          list.length > MAX_DAYS ? list.slice(list.length - MAX_DAYS) : list;

        setDailyStats(trimmed);
      },
      (err) => {
        console.error("일별 집계 구독 실패:", err);
        setDailyStats([]);
      }
    );

    // 월단위 집계
    const unsubMonth = onValue(
      monthRef,
      (snap) => {
        if (!snap.exists()) {
          setMonthlyStats([]);
          return;
        }
        const list = [];
        snap.forEach((child) => {
          const v = child.val() || {};
          list.push({
            monthKey: child.key, // YYYY-MM
            elec: Number(v.elecSum ?? 0),
            water: Number(v.waterSum ?? 0),
            gas: Number(v.gasSum ?? 0),
            temp: Number(v.tempAvg ?? 0),
            eventCounts: v.eventCounts || {},
            alarmCount: Number(v.alarmCount ?? 0),
          });
        });
        list.sort((a, b) => (a.monthKey < b.monthKey ? -1 : 1));

        const MAX_MONTHS = 36;
        const trimmed =
          list.length > MAX_MONTHS
            ? list.slice(list.length - MAX_MONTHS)
            : list;

        setMonthlyStats(trimmed);
      },
      (err) => {
        console.error("월별 집계 구독 실패:", err);
        setMonthlyStats([]);
      }
    );

    return () => {
      unsubMinute();
      unsubHour();
      unsubDay();
      unsubMonth();
    };
  }, [floor]);

  // 🔹 히스토리 정보
  const secondHistoryInfo = useMemo(
    () => buildHistoryInfo(rawData, "createdAt"),
    [rawData]
  );
  const minuteHistoryInfo = useMemo(
    () => buildHistoryInfo(minuteAgg, "ts"),
    [minuteAgg]
  );
  const hourHistoryInfo = useMemo(
    () => buildHistoryInfo(hourAgg, "ts"),
    [hourAgg]
  );

  // ✅ 각 단위별로, 슬라이더 위치(realtimeWindowPos)에 맞는 구간을 잘라낸 것
  const secondChartWindow = useMemo(
    () =>
      buildTimeWindow(
        rawData,
        secondHistoryInfo,
        realtimeWindowSeconds,
        realtimeWindowPos,
        "createdAt"
      ),
    [rawData, secondHistoryInfo, realtimeWindowSeconds, realtimeWindowPos]
  );

  const minuteChartWindow = useMemo(
    () =>
      buildTimeWindow(
        minuteAgg,
        minuteHistoryInfo,
        realtimeWindowSeconds,
        realtimeWindowPos,
        "ts"
      ),
    [minuteAgg, minuteHistoryInfo, realtimeWindowSeconds, realtimeWindowPos]
  );

  const hourChartWindow = useMemo(
    () =>
      buildTimeWindow(
        hourAgg,
        hourHistoryInfo,
        realtimeWindowSeconds,
        realtimeWindowPos,
        "ts"
      ),
    [hourAgg, hourHistoryInfo, realtimeWindowSeconds, realtimeWindowPos]
  );

  // ✅ 선택된 구간 전체에 대한 "이벤트 요약" 계산
  const realtimeEventSummary = useMemo(() => {
    if (tab !== "realtime") return null;

    let src = [];
    if (realtimeSourceType === "second") {
      src = secondChartWindow;
    } else if (realtimeSourceType === "minute") {
      src = minuteChartWindow;
    } else {
      src = hourChartWindow;
    }

    if (!src.length) return null;

    const aggregated = {};
    let alarmTotal = 0;

    if (realtimeSourceType === "second") {
      // 초단위 raw 기준
      src.forEach((row) => {
        const mainEvent = row.mainEventType;
        const events = row.eventTypes || [];
        if (mainEvent) {
          aggregated[mainEvent] = (aggregated[mainEvent] || 0) + 1;
        }
        events.forEach((t) => {
          if (!t) return;
          aggregated[t] = (aggregated[t] || 0) + 1;
        });
        if (row.isAlarm) alarmTotal += 1;
      });
    } else {
      // 분/시단위 집계 기준
      src.forEach((row) => {
        const ec = row.eventCounts || {};
        for (const [type, cnt] of Object.entries(ec)) {
          aggregated[type] = (aggregated[type] || 0) + (cnt || 0);
        }
        alarmTotal += row.alarmCount || 0;
      });
    }

    const entries = Object.entries(aggregated).filter(
      ([type]) => !!type && type !== "normal"
    );

    if (!entries.length && alarmTotal === 0) {
      return { alarmTotal: 0, sortedEvents: [] };
    }

    entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

    return { alarmTotal, sortedEvents: entries };
  }, [
    tab,
    realtimeSourceType,
    secondChartWindow,
    minuteChartWindow,
    hourChartWindow,
  ]);

  // -------------------- 실시간 차트 렌더 --------------------
  const renderRealtimeCharts = () => {
    let src = [];
    if (realtimeSourceType === "second") {
      src = secondChartWindow;
    } else if (realtimeSourceType === "minute") {
      src = minuteChartWindow;
    } else {
      src = hourChartWindow;
    }

    const labels = src.map((r) => {
      if (realtimeSourceType === "second") {
        // 예: 10:34:10
        return r.createdAt ? formatTimeLabel(r.createdAt) : "";
      }
      if (realtimeSourceType === "minute") {
        // 예: 10:34
        return formatTimeLabelMinute(r.ts);
      }
      // hour 단위일 때: 예) 11/28 10시
      return formatTimeLabelHour(r.ts);
    });

    const elecValues = src.map((r) => Number(r.elec) || 0);
    const waterValues = src.map((r) => Number(r.water) || 0);
    const gasValues = src.map((r) => Number(r.gas) || 0);
    const tempValues = src.map((r) => Number(r.temp) || 0);

    function calcRange(
      values,
      { allowNegative = false, fallbackMin = 0, fallbackMax = 1 } = {}
    ) {
      const valid = values.filter((v) => Number.isFinite(v));
      if (valid.length === 0) {
        return {
          min: fallbackMin,
          max: fallbackMax,
        };
      }

      let min = Math.min(...valid);
      let max = Math.max(...valid);

      if (min === max) {
        // 변화 거의 없을 때: 값 기준 ±5%
        const base = Math.abs(min) || 1;
        const pad = base * 0.05;
        min = min - pad;
        max = max + pad;
      } else {
        // 값 차이 기준 ±10%
        const diff = max - min;
        const pad = diff * 0.1;
        min = min - pad;
        max = max + pad;
      }

      if (!allowNegative && min < 0) {
        min = 0;
      }

      if (min === max) {
        max = min + 1;
      }

      return { min, max };
    }

    const realtimeTooltip = {
      callbacks: {
        label(context) {
          const value = context.formattedValue;
          return `${context.dataset.label}: ${value}`;
        },
        afterBody(items) {
          if (!items.length) return [];
          const idx = items[0].dataIndex;
          const row = src[idx];
          if (!row) return [];

          // 초단위 raw
          if (realtimeSourceType === "second") {
            const mainEventType = row.mainEventType;
            const eventTypes = row.eventTypes || [];
            const isAlarm = row.isAlarm;

            const lines = [];

            if (mainEventType) {
              const mainLabel =
                EVENT_LABELS[mainEventType] || String(mainEventType);
              lines.push(`주요 이벤트: ${mainLabel}`);
            }

            if (eventTypes.length > 0) {
              const translated = eventTypes.map(
                (t) => EVENT_LABELS[t] || String(t)
              );
              lines.push(`전체 이벤트: ${translated.join(", ")}`);
            }

            if (!mainEventType && eventTypes.length === 0) {
              lines.push("이 시점 이벤트: 없음");
            }

            if (isAlarm) {
              lines.push("⚠ 경보 이벤트 포함");
            }

            return lines;
          }

          // 분/시 단위 집계
          const ec = row.eventCounts || {};
          const entries = Object.entries(ec).filter(
            ([t]) => !!t && t !== "normal"
          );

          if (entries.length === 0 && !(row.alarmCount > 0)) {
            return ["이 시점 이벤트: 없음 (집계 데이터)"];
          }

          entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));

          const lines = ["이 시점 이벤트(집계):"];
          lines.push(
            ...entries.slice(0, 3).map(([type, cnt]) => {
              const label = EVENT_LABELS[type] || type;
              return `- ${label}: ${cnt}회`;
            })
          );

          if (row.alarmCount > 0) {
            lines.push(`⚠ 경보 관련 샘플: ${row.alarmCount}개`);
          }

          return lines;
        },
      },
    };

    const baseRealtimeOptions = {
      ...commonLineOptions,
      plugins: {
        ...commonLineOptions.plugins,
        tooltip: realtimeTooltip,
      },
      animations: {
        x: {
          duration: 200,
          easing: "linear",
        },
        y: {
          duration: 0,
        },
      },
      scales: {
        ...commonLineOptions.scales,
        y: {
          ...commonLineOptions.scales.y,
          beginAtZero: false,
        },
      },
    };

    const elecRange = calcRange(elecValues, {
      allowNegative: false,
      fallbackMax: 5,
    });
    const waterRange = calcRange(waterValues, {
      allowNegative: false,
      fallbackMax: 2,
    });
    const gasRange = calcRange(gasValues, {
      allowNegative: false,
      fallbackMax: 2,
    });
    const tempRange = calcRange(tempValues, {
      allowNegative: true,
      fallbackMin: 15,
      fallbackMax: 30,
    });

    const elecOptions = {
      ...baseRealtimeOptions,
      scales: {
        ...baseRealtimeOptions.scales,
        y: {
          ...baseRealtimeOptions.scales.y,
          ...elecRange,
        },
      },
    };

    const waterOptions = {
      ...baseRealtimeOptions,
      scales: {
        ...baseRealtimeOptions.scales,
        y: {
          ...baseRealtimeOptions.scales.y,
          ...waterRange,
        },
      },
    };

    const gasOptions = {
      ...baseRealtimeOptions,
      scales: {
        ...baseRealtimeOptions.scales,
        y: {
          ...baseRealtimeOptions.scales.y,
          ...gasRange,
        },
      },
    };

    const tempOptions = {
      ...baseRealtimeOptions,
      scales: {
        ...baseRealtimeOptions.scales,
        y: {
          ...baseRealtimeOptions.scales.y,
          ...tempRange,
        },
      },
    };

    return (
      <div className="chart-grid">
        <div className="chart-card">
          <h3>층 전력 사용량 (실시간)</h3>
          <div className="chart-inner">
            <Line
              data={buildLineData(labels, elecValues, "kW")}
              options={elecOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>층 수도 사용량 (실시간)</h3>
          <div className="chart-inner">
            <Line
              data={buildLineData(labels, waterValues, "ℓ/h")}
              options={waterOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>층 도시가스 사용량 (실시간)</h3>
          <div className="chart-inner">
            <Line
              data={buildLineData(labels, gasValues, "m³/h")}
              options={gasOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>층 평균 온도 (실시간)</h3>
          <div className="chart-inner">
            <Line
              data={buildLineData(labels, tempValues, "℃")}
              options={tempOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  // -------------------- 일별 / 주별 / 월별 (막대 그래프) --------------------
  const renderDailyCharts = () => {
    const visibleDaily = sliceWindowByPos(
      dailyStats,
      MAX_DAILY_BARS,
      dailyWindowPos
    );

    const labels = visibleDaily.map((d) => formatDayLabel(d.dateKey));
    const elecValues = visibleDaily.map((d) => d.elec);
    const waterValues = visibleDaily.map((d) => d.water);
    const gasValues = visibleDaily.map((d) => d.gas);
    const tempValues = visibleDaily.map((d) => d.temp);

    return (
      <div className="chart-grid">
        <div className="chart-card">
          <h3>전력 사용량 (일별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, elecValues, "kWh (일 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>수도 사용량 (일별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, waterValues, "m³ (일 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>도시가스 사용량 (일별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, gasValues, "m³ (일 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>평균 온도 (일별 평균)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, tempValues, "℃ (일 평균)")}
              options={commonBarOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyCharts = () => {
    const visibleWeekly = sliceWindowByPos(
      weeklyStats,
      MAX_WEEKLY_BARS,
      weeklyWindowPos
    );

    const labels = visibleWeekly.map((w) => formatWeekLabel(w.weekKey));
    const elecValues = visibleWeekly.map((w) => w.elec);
    const waterValues = visibleWeekly.map((w) => w.water);
    const gasValues = visibleWeekly.map((w) => w.gas);
    const tempValues = visibleWeekly.map((w) => w.temp);

    return (
      <div className="chart-grid">
        <div className="chart-card">
          <h3>전력 사용량 (주별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, elecValues, "kWh (주 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>수도 사용량 (주별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, waterValues, "m³ (주 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>도시가스 사용량 (주별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, gasValues, "m³ (주 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>평균 온도 (주별 평균)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, tempValues, "℃ (주 평균)")}
              options={commonBarOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyCharts = () => {
    const visibleMonthly = sliceWindowByPos(
      monthlyStats,
      MAX_MONTHLY_BARS,
      monthlyWindowPos
    );

    const labels = visibleMonthly.map((m) => formatMonthLabel(m.monthKey));
    const elecValues = visibleMonthly.map((m) => m.elec);
    const waterValues = visibleMonthly.map((m) => m.water);
    const gasValues = visibleMonthly.map((m) => m.gas);
    const tempValues = visibleMonthly.map((m) => m.temp);

    return (
      <div className="chart-grid">
        <div className="chart-card">
          <h3>전력 사용량 (월별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, elecValues, "kWh (월 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>수도 사용량 (월별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, waterValues, "m³ (월 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>도시가스 사용량 (월별 합계)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, gasValues, "m³ (월 합계)")}
              options={commonBarOptions}
            />
          </div>
        </div>
        <div className="chart-card">
          <h3>평균 온도 (월별 평균)</h3>
          <div className="chart-inner">
            <Bar
              data={buildBarData(labels, tempValues, "℃ (월 평균)")}
              options={commonBarOptions}
            />
          </div>
        </div>
      </div>
    );
  };

  // 🔍 실시간 히스토리 길이에 따라 슬라이더 노출 여부
  const activeHistoryInfo =
    realtimeSourceType === "second"
      ? secondHistoryInfo
      : realtimeSourceType === "minute"
      ? minuteHistoryInfo
      : hourHistoryInfo;

  const showRealtimeSlider =
    tab === "realtime" &&
    activeHistoryInfo &&
    activeHistoryInfo.totalSec > realtimeWindowSeconds;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>
        실시간 층별 에너지 모니터링 ({floor})
      </h2>

      {/* 🔧 시뮬레이션 설정 (전체층수 / 지하층수 / 방 개수 / 배속) */}
      <div
        style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        <div>
          <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            전체 층수
          </label>
          <input
            type="number"
            min={1}
            value={totalFloors}
            onChange={(e) => setTotalFloors(Number(e.target.value) || 0)}
            style={{
              width: 80,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            지하 층수
          </label>
          <input
            type="number"
            min={0}
            value={basementFloors}
            onChange={(e) => setBasementFloors(Number(e.target.value) || 0)}
            style={{
              width: 80,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            층당 방 개수
          </label>
          <input
            type="number"
            min={1}
            value={roomsPerFloor}
            onChange={(e) => setRoomsPerFloor(Number(e.target.value) || 0)}
            style={{
              width: 80,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            시뮬레이션 배속
          </label>
          <input
            type="number"
            min={1}
            value={simSpeed}
            onChange={(e) => setSimSpeed(Number(e.target.value) || 1)}
            style={{
              width: 80,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            onClick={handleSaveSimConfig}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            설정 저장
          </button>
          {floorIds.length > 0 && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#4b5563",
                maxWidth: 400,
              }}
            >
              생성 층: {floorIds.join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* 층 선택 */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <label>
          층 :{" "}
          {floorIds.length > 0 ? (
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              style={{
                minWidth: 80,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            >
              {floorIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              style={{ width: 60 }}
            />
          )}
        </label>
      </div>

      {/* 탭 버튼 */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setTab("realtime")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "realtime" ? "#2563eb" : "#e5e7eb",
            color: tab === "realtime" ? "#fff" : "#111827",
            fontWeight: 600,
          }}
        >
          실시간 (초/분/시 단위)
        </button>
        <button
          type="button"
          onClick={() => setTab("daily")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "daily" ? "#2563eb" : "#e5e7eb",
            color: tab === "daily" ? "#fff" : "#111827",
            fontWeight: 600,
          }}
        >
          일별
        </button>
        <button
          type="button"
          onClick={() => setTab("weekly")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "weekly" ? "#2563eb" : "#e5e7eb",
            color: tab === "weekly" ? "#fff" : "#111827",
            fontWeight: 600,
          }}
        >
          주별
        </button>
        <button
          type="button"
          onClick={() => setTab("monthly")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            backgroundColor: tab === "monthly" ? "#2563eb" : "#e5e7eb",
            color: tab === "monthly" ? "#fff" : "#111827",
            fontWeight: 600,
          }}
        >
          월별
        </button>
      </div>

      {/* 🔄 층별 더미 데이터 생성기 (관리용) */}
      {floorIds.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <FakeRealtimeGenerator
            floorIds={floorIds}
            roomsPerFloor={roomsPerFloor}
            speed={simSpeed}
          />
        </div>
      )}

      {/* ✅ 실시간 탭: 구간(초) 선택 버튼 + 타임 슬라이더 */}
      {tab === "realtime" && (
        <>
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {REALTIME_WINDOW_PRESETS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setRealtimeWindowSeconds(w.seconds)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor:
                    realtimeWindowSeconds === w.seconds ? "#16a34a" : "#e5e7eb",
                  color:
                    realtimeWindowSeconds === w.seconds ? "#fff" : "#111827",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* 실시간 슬라이더 (초/분/시 공통) */}
          {showRealtimeSlider && (
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                시간 이동
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((realtimeWindowPos ?? 1) * 100)}
                onChange={(e) =>
                  setRealtimeWindowPos(Number(e.target.value) / 100)
                }
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                과거 ↔ 현재
              </span>
            </div>
          )}

          {realtimeEventSummary && (
            <div
              style={{
                marginBottom: 16,
                padding: "8px 10px",
                borderRadius: 8,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                이 구간에서 발생한 이벤트 요약
              </div>
              {realtimeEventSummary.sortedEvents.length === 0 ? (
                <div>특이 이벤트 없음</div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {realtimeEventSummary.sortedEvents
                    .slice(0, 8)
                    .map(([type, cnt]) => {
                      const label = EVENT_LABELS[type] || type;
                      return (
                        <span
                          key={type}
                          style={{
                            padding: "2px 6px",
                            borderRadius: 999,
                            background: "#e5e7eb",
                          }}
                        >
                          {label} {cnt}회
                        </span>
                      );
                    })}
                </div>
              )}
              {realtimeEventSummary.alarmTotal > 0 && (
                <div style={{ marginTop: 4 }}>
                  ⚠ 경보 관련 샘플: {realtimeEventSummary.alarmTotal}개
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ✅ 일별/주별/월별 슬라이더 (기간 이동) */}
      {tab === "daily" && dailyStats.length > MAX_DAILY_BARS && (
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>기간 이동</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((dailyWindowPos ?? 1) * 100)}
            onChange={(e) => setDailyWindowPos(Number(e.target.value) / 100)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            과거 ↔ 최근
          </span>
        </div>
      )}

      {tab === "weekly" && weeklyStats.length > MAX_WEEKLY_BARS && (
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>기간 이동</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((weeklyWindowPos ?? 1) * 100)}
            onChange={(e) => setWeeklyWindowPos(Number(e.target.value) / 100)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            과거 ↔ 최근
          </span>
        </div>
      )}

      {tab === "monthly" && monthlyStats.length > MAX_MONTHLY_BARS && (
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>기간 이동</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((monthlyWindowPos ?? 1) * 100)}
            onChange={(e) => setMonthlyWindowPos(Number(e.target.value) / 100)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            과거 ↔ 최근
          </span>
        </div>
      )}

      {/* 차트 영역 */}
      <div>
        {tab === "realtime" && renderRealtimeCharts()}
        {tab === "daily" && renderDailyCharts()}
        {tab === "weekly" && renderWeeklyCharts()}
        {tab === "monthly" && renderMonthlyCharts()}
      </div>

      <style>{`
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .chart-card {
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 12px 16px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          min-height: 500px;
          display: flex;
          flex-direction: column;
        }
        .chart-card h3 {
          font-size: 14px;
          margin-bottom: 8px;
          color: #111827;
        }
        .chart-inner {
          flex: 1;
        }
      `}</style>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={handleDeleteRealtime}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #f97316",
            background: "#fff7ed",
            color: "#9a3412",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          realtime 전체 삭제
        </button>
        <button
          onClick={handleDeleteAll}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #dc2626",
            background: "#fef2f2",
            color: "#991b1b",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          에너지 데이터 전체 초기화
        </button>
      </div>
    </div>
  );
}
