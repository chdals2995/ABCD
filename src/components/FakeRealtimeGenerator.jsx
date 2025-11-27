// src/components/FakeRealtimeGenerator.jsx
import { useEffect, useRef } from "react";
import {
  saveRoomRealtimeData,
  cleanupOldRealtimeSeconds,
  cleanupOldMinuteAggregates,
  cleanupOldHourAggregates,
} from "../services/saveRoomRealtimeData";

/**
 * 시뮬레이션 모드
 * - "demo" : 이벤트 자주 발생, 유지시간 짧음 (테스트용)
 * - "real" : 이벤트 드물고, 누수/가스누출은 장기간 유지 (현실감↑)
 */
const MODE = "demo";

/** 🔹 RTDB 저장 간격(가상 초 단위) */
const SAVE_INTERVAL_SECONDS = 10;

/** 🔹 방 활성 상태 재판정 간격(가상 초 단위) – 5분 */
const ACTIVE_ROOMS_UPDATE_INTERVAL_SECONDS = 300;

/**
 * 기본 설정
 */
const OFF_HOURS_PER_DAY = 11; // 0~6시(7h) + 20~23시(4h)
const WORK_HOURS_PER_DAY = 9; // 9~18시

function calcProbPerSecond(daysInterval, hoursPerDay) {
  return 1 / (daysInterval * hoursPerDay * 3600);
}

function randomInt(minSeconds, maxSeconds) {
  return minSeconds + Math.floor(Math.random() * (maxSeconds - minSeconds + 1));
}

// 이벤트 타입 정의
const EVENT_TYPES = {
  NORMAL: "normal",
  OVERTIME: "overtime",
  FIRE: "fire",
  CONFERENCE: "conference",
  TRAINING: "training",
  TOUR: "tour",
  EQUIPMENT_TEST_BOILER: "equipment_test_boiler",
  VENTILATION_BOOST: "ventilation_boost",
  WINDOW_OPEN: "window_open",
  EQUIPMENT_OFF: "equipment_off",
  LIGHT_LEFT_ON: "light_left_on",
  WATER_LEAK: "water_leak",
  GAS_LEAK: "gas_leak",
  HVAC_FAULT: "hvac_fault",
  POWER_ISSUE: "power_issue",
  CLEANING: "cleaning",
};

// 이벤트 우선순위 (값이 클수록 강함)
const EVENT_PRIORITY = {
  [EVENT_TYPES.FIRE]: 100,
  [EVENT_TYPES.GAS_LEAK]: 90,
  [EVENT_TYPES.WATER_LEAK]: 90,
  [EVENT_TYPES.POWER_ISSUE]: 80,
  [EVENT_TYPES.HVAC_FAULT]: 70,
  [EVENT_TYPES.EQUIPMENT_OFF]: 60,
  [EVENT_TYPES.OVERTIME]: 55,
  [EVENT_TYPES.EQUIPMENT_TEST_BOILER]: 50,
  [EVENT_TYPES.VENTILATION_BOOST]: 45,
  [EVENT_TYPES.CONFERENCE]: 40,
  [EVENT_TYPES.TRAINING]: 40,
  [EVENT_TYPES.TOUR]: 30,
  [EVENT_TYPES.WINDOW_OPEN]: 30,
  [EVENT_TYPES.CLEANING]: 25,
  [EVENT_TYPES.LIGHT_LEFT_ON]: 20,
};

/**
 * MODE에 따라 "며칠마다 한 번" 간격 설정
 */
const FIRE_INTERVAL_DAYS = MODE === "demo" ? 365 : 365 * 5;
const OVERTIME_INTERVAL_DAYS = MODE === "demo" ? 7 : 14;
const CONFERENCE_INTERVAL_DAYS = MODE === "demo" ? 3 : 7;
const TRAINING_INTERVAL_DAYS = MODE === "demo" ? 14 : 30;
const TOUR_INTERVAL_DAYS = MODE === "demo" ? 10 : 30;
const EQUIPMENT_TEST_INTERVAL_DAYS = MODE === "demo" ? 30 : 60;
const VENTILATION_INTERVAL_DAYS = MODE === "demo" ? 10 : 20;
const WINDOW_OPEN_INTERVAL_DAYS = MODE === "demo" ? 10 : 30;
const EQUIPMENT_OFF_INTERVAL_DAYS = MODE === "demo" ? 60 : 120;
const LIGHT_LEFT_ON_INTERVAL_DAYS = MODE === "demo" ? 5 : 10;

// 누수/가스누출 간격
const WATER_LEAK_INTERVAL_DAYS = MODE === "demo" ? 60 : 365;
const GAS_LEAK_INTERVAL_DAYS = MODE === "demo" ? 180 : 365 * 3;

const HVAC_FAULT_INTERVAL_DAYS = MODE === "demo" ? 90 : 180;
const POWER_ISSUE_INTERVAL_DAYS = MODE === "demo" ? 90 : 180;
const CLEANING_INTERVAL_DAYS = MODE === "demo" ? 2 : 3;

// 초당 확률 계산
const FIRE_PROB_OFF = calcProbPerSecond(FIRE_INTERVAL_DAYS, OFF_HOURS_PER_DAY);
const OVERTIME_PROB_OFF = calcProbPerSecond(
  OVERTIME_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const CONFERENCE_PROB_WORK = calcProbPerSecond(
  CONFERENCE_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const TRAINING_PROB_WORK = calcProbPerSecond(
  TRAINING_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const TOUR_PROB_WORK = calcProbPerSecond(
  TOUR_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const EQUIPMENT_TEST_PROB_OFF = calcProbPerSecond(
  EQUIPMENT_TEST_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const VENTILATION_PROB_WORK = calcProbPerSecond(
  VENTILATION_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const WINDOW_OPEN_PROB_WORK = calcProbPerSecond(
  WINDOW_OPEN_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const EQUIPMENT_OFF_PROB_WORK = calcProbPerSecond(
  EQUIPMENT_OFF_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const LIGHT_LEFT_ON_PROB_OFF = calcProbPerSecond(
  LIGHT_LEFT_ON_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const WATER_LEAK_PROB_OFF = calcProbPerSecond(
  WATER_LEAK_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const GAS_LEAK_PROB_OFF = calcProbPerSecond(
  GAS_LEAK_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const HVAC_FAULT_PROB_WORK = calcProbPerSecond(
  HVAC_FAULT_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const POWER_ISSUE_PROB_WORK = calcProbPerSecond(
  POWER_ISSUE_INTERVAL_DAYS,
  WORK_HOURS_PER_DAY
);
const POWER_ISSUE_PROB_OFF = calcProbPerSecond(
  POWER_ISSUE_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);
const CLEANING_PROB_OFF = calcProbPerSecond(
  CLEANING_INTERVAL_DAYS,
  OFF_HOURS_PER_DAY
);

// 이벤트 지속시간 설정
const WATER_LEAK_LIFETIME =
  MODE === "demo"
    ? {
        baseMin: 7200,
        baseMax: 43200,
        extraMin: 3600,
        extraMax: 21600,
        extendProb: 0.7,
        maxExtensions: 5,
      }
    : {
        baseMin: 7 * 24 * 3600,
        baseMax: 30 * 24 * 3600,
        extraMin: 7 * 24 * 3600,
        extraMax: 30 * 24 * 3600,
        extendProb: 0.6,
        maxExtensions: 4,
      };

const GAS_LEAK_LIFETIME =
  MODE === "demo"
    ? {
        baseMin: 3600,
        baseMax: 21600,
        extraMin: 1800,
        extraMax: 14400,
        extendProb: 0.6,
        maxExtensions: 4,
      }
    : {
        baseMin: 24 * 3600,
        baseMax: 14 * 24 * 3600,
        extraMin: 12 * 3600,
        extraMax: 7 * 24 * 3600,
        extendProb: 0.5,
        maxExtensions: 4,
      };

const EVENT_LIFETIME = {
  [EVENT_TYPES.FIRE]: {
    baseMin: 300,
    baseMax: 600,
    extraMin: 60,
    extraMax: 300,
    extendProb: 0.3,
    maxExtensions: 3,
  },
  [EVENT_TYPES.OVERTIME]: {
    baseMin: 1800,
    baseMax: 3600,
    extraMin: 900,
    extraMax: 1800,
    extendProb: 0.5,
    maxExtensions: 4,
  },
  [EVENT_TYPES.LIGHT_LEFT_ON]: {
    baseMin: 3600,
    baseMax: 14400,
    extraMin: 1800,
    extraMax: 7200,
    extendProb: 0.4,
    maxExtensions: 3,
  },
  [EVENT_TYPES.WATER_LEAK]: WATER_LEAK_LIFETIME,
  [EVENT_TYPES.GAS_LEAK]: GAS_LEAK_LIFETIME,
  [EVENT_TYPES.EQUIPMENT_TEST_BOILER]: {
    baseMin: 1800,
    baseMax: 5400,
    extraMin: 900,
    extraMax: 3600,
    extendProb: 0.3,
    maxExtensions: 2,
  },
  [EVENT_TYPES.CLEANING]: {
    baseMin: 1800,
    baseMax: 3600,
    extraMin: 900,
    extraMax: 1800,
    extendProb: 0.4,
    maxExtensions: 2,
  },
  [EVENT_TYPES.CONFERENCE]: {
    baseMin: 3600,
    baseMax: 10800,
    extraMin: 1800,
    extraMax: 7200,
    extendProb: 0.4,
    maxExtensions: 2,
  },
  [EVENT_TYPES.TRAINING]: {
    baseMin: 7200,
    baseMax: 14400,
    extraMin: 3600,
    extraMax: 7200,
    extendProb: 0.5,
    maxExtensions: 2,
  },
  [EVENT_TYPES.TOUR]: {
    baseMin: 1800,
    baseMax: 5400,
    extraMin: 900,
    extraMax: 3600,
    extendProb: 0.3,
    maxExtensions: 2,
  },
  [EVENT_TYPES.VENTILATION_BOOST]: {
    baseMin: 1800,
    baseMax: 7200,
    extraMin: 900,
    extraMax: 3600,
    extendProb: 0.4,
    maxExtensions: 2,
  },
  [EVENT_TYPES.WINDOW_OPEN]: {
    baseMin: 3600,
    baseMax: 14400,
    extraMin: 1800,
    extraMax: 7200,
    extendProb: 0.5,
    maxExtensions: 3,
  },
  [EVENT_TYPES.EQUIPMENT_OFF]: {
    baseMin: 3600,
    baseMax: 10800,
    extraMin: 1800,
    extraMax: 7200,
    extendProb: 0.4,
    maxExtensions: 2,
  },
  [EVENT_TYPES.HVAC_FAULT]: {
    baseMin: 3600,
    baseMax: 10800,
    extraMin: 1800,
    extraMax: 7200,
    extendProb: 0.5,
    maxExtensions: 3,
  },
  [EVENT_TYPES.POWER_ISSUE]: {
    baseMin: 30,
    baseMax: 300,
    extraMin: 30,
    extraMax: 120,
    extendProb: 0.3,
    maxExtensions: 3,
  },
};

function smoothTowards(prev, target, { maxStep, jitter = 0, digits }) {
  const diff = target - prev;
  let step = diff;
  if (Math.abs(diff) > maxStep) {
    step = Math.sign(diff) * maxStep;
  }
  const noise = (Math.random() * 2 - 1) * jitter;
  const next = prev + step + noise;
  return Number(next.toFixed(digits));
}

/**
 * 🔹 시간대/요일에 따른 "방 1개 기준" 사용량 (per-room baseline)
 * - 온도는 층 평균이라고 보고 그대로 사용
 */
function getBaselines(now) {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  let temp;
  let elecPerRoom;
  let waterPerRoom;
  let gasPerRoom;

  if (isWeekend) {
    if (hour < 6) {
      temp = 8;
      elecPerRoom = 0.3;
      waterPerRoom = 0.03;
      gasPerRoom = 0.05;
    } else if (hour < 9) {
      temp = 16;
      elecPerRoom = 0.7;
      waterPerRoom = 0.05;
      gasPerRoom = 0.15;
    } else if (hour < 18) {
      temp = 20;
      elecPerRoom = 1.5;
      waterPerRoom = 0.1;
      gasPerRoom = 0.3;
    } else if (hour < 22) {
      temp = 19;
      elecPerRoom = 0.9;
      waterPerRoom = 0.06;
      gasPerRoom = 0.15;
    } else {
      temp = 10;
      elecPerRoom = 0.3;
      waterPerRoom = 0.03;
      gasPerRoom = 0.05;
    }
  } else {
    if (hour < 5) {
      temp = 7;
      elecPerRoom = 0.3;
      waterPerRoom = 0.02;
      gasPerRoom = 0.05;
    } else if (hour < 8) {
      temp = 18;
      elecPerRoom = 1.0;
      waterPerRoom = 0.1;
      gasPerRoom = 0.6;
    } else if (hour < 11) {
      temp = 22;
      elecPerRoom = 3.0;
      waterPerRoom = 0.4;
      gasPerRoom = 1.0;
    } else if (hour < 14) {
      temp = 23;
      elecPerRoom = 3.5;
      waterPerRoom = 0.6;
      gasPerRoom = 1.3;
    } else if (hour < 18) {
      temp = 22;
      elecPerRoom = 3.0;
      waterPerRoom = 0.5;
      gasPerRoom = 1.1;
    } else if (hour < 22) {
      temp = 21;
      elecPerRoom = 1.5;
      waterPerRoom = 0.2;
      gasPerRoom = 0.5;
    } else {
      temp = 9;
      elecPerRoom = 0.4;
      waterPerRoom = 0.03;
      gasPerRoom = 0.1;
    }
  }

  return {
    temp,
    elec: elecPerRoom,
    water: waterPerRoom,
    gas: gasPerRoom,
  };
}

/**
 * 🔹 현재 시각 기준 “목표 점유율” 범위 (min/max ratio) 계산
 */
function getOccupancyRatioRange(now) {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  let minRatio = 0;
  let maxRatio = 0;

  if (isWeekend) {
    if (hour < 9) {
      minRatio = 0;
      maxRatio = 0.15;
    } else if (hour < 18) {
      minRatio = 0.15;
      maxRatio = 0.4;
    } else {
      minRatio = 0;
      maxRatio = 0.2;
    }
  } else {
    if (hour < 6) {
      minRatio = 0;
      maxRatio = 0.1;
    } else if (hour < 9) {
      minRatio = 0.2;
      maxRatio = 0.5;
    } else if (hour < 12) {
      minRatio = 0.5;
      maxRatio = 0.9;
    } else if (hour < 13) {
      minRatio = 0.3;
      maxRatio = 0.7;
    } else if (hour < 18) {
      minRatio = 0.5;
      maxRatio = 0.9;
    } else if (hour < 21) {
      minRatio = 0.2;
      maxRatio = 0.6;
    } else {
      minRatio = 0;
      maxRatio = 0.2;
    }
  }

  return { minRatio, maxRatio };
}

function getTargetOccupancyRatio(now) {
  const { minRatio, maxRatio } = getOccupancyRatioRange(now);
  return (minRatio + maxRatio) / 2;
}

function applySingleEventEffect(baseline, eventType) {
  const base = { ...baseline };

  switch (eventType) {
    case EVENT_TYPES.OVERTIME:
      return {
        temp: Math.max(base.temp, 22),
        elec: Math.max(base.elec, 2.5),
        water: Math.max(base.water, 0.2),
        gas: Math.max(base.gas, 0.8),
      };
    case EVENT_TYPES.FIRE:
      return {
        temp: Math.max(base.temp, 45),
        elec: Math.max(base.elec, 8),
        water: Math.max(base.water, 5),
        gas: Math.max(base.gas, 4),
      };
    case EVENT_TYPES.CONFERENCE:
      return {
        temp: base.temp + 0.5,
        elec: base.elec * 1.5,
        water: base.water * 1.3,
        gas: base.gas * 1.1,
      };
    case EVENT_TYPES.TRAINING:
      return {
        temp: base.temp + 0.3,
        elec: base.elec * 1.3,
        water: base.water * 1.2,
        gas: base.gas * 1.2,
      };
    case EVENT_TYPES.TOUR:
      return {
        temp: base.temp + 0.2,
        elec: base.elec * 1.2,
        water: base.water * 1.1,
        gas: base.gas * 1.05,
      };
    case EVENT_TYPES.EQUIPMENT_TEST_BOILER:
      return {
        temp: base.temp + 1,
        elec: base.elec * 1.2,
        water: base.water,
        gas: base.gas + 1.0,
      };
    case EVENT_TYPES.VENTILATION_BOOST:
      return {
        temp: base.temp,
        elec: base.elec * 1.4,
        water: base.water,
        gas: base.gas * 1.2,
      };
    case EVENT_TYPES.WINDOW_OPEN:
      return {
        temp: base.temp - 1.5,
        elec: base.elec * 1.1,
        water: base.water,
        gas: base.gas * 1.5,
      };
    case EVENT_TYPES.EQUIPMENT_OFF:
      return {
        temp: base.temp - 3,
        elec: base.elec * 0.2,
        water: base.water,
        gas: base.gas * 0.1,
      };
    case EVENT_TYPES.LIGHT_LEFT_ON:
      return {
        temp: base.temp,
        elec: Math.max(base.elec, 0.7),
        water: base.water,
        gas: base.gas,
      };
    case EVENT_TYPES.WATER_LEAK:
      return {
        temp: base.temp,
        elec: base.elec,
        water: Math.max(base.water, 0.3),
        gas: base.gas,
      };
    case EVENT_TYPES.GAS_LEAK:
      return {
        temp: base.temp,
        elec: base.elec,
        water: base.water,
        gas: Math.max(base.gas, 0.3),
      };
    case EVENT_TYPES.HVAC_FAULT:
      return {
        temp: base.temp - 3,
        elec: base.elec * 1.3,
        water: base.water,
        gas: base.gas * 1.3,
      };
    case EVENT_TYPES.POWER_ISSUE:
      return {
        temp: base.temp,
        elec: base.elec * 0.1,
        water: base.water,
        gas: base.gas,
      };
    case EVENT_TYPES.CLEANING:
      return {
        temp: base.temp,
        elec: base.elec * 1.2,
        water: Math.max(base.water, 0.4),
        gas: base.gas,
      };
    default:
      return base;
  }
}

function applyAllEventEffects(baseline, events) {
  if (!events || events.length === 0) return baseline;

  const sorted = [...events].sort((a, b) => {
    const pa = EVENT_PRIORITY[a.type] ?? 0;
    const pb = EVENT_PRIORITY[b.type] ?? 0;
    return pa - pb;
  });

  return sorted.reduce((acc, ev) => applySingleEventEffect(acc, ev.type), {
    ...baseline,
  });
}

function isAlarmEventType(type) {
  return (
    type === EVENT_TYPES.FIRE ||
    type === EVENT_TYPES.GAS_LEAK ||
    type === EVENT_TYPES.WATER_LEAK ||
    type === EVENT_TYPES.HVAC_FAULT ||
    type === EVENT_TYPES.POWER_ISSUE
  );
}

function getMainEventType(events) {
  if (!events || events.length === 0) return EVENT_TYPES.NORMAL;
  let best = events[0];
  for (const ev of events) {
    const pBest = EVENT_PRIORITY[best.type] ?? 0;
    const p = EVENT_PRIORITY[ev.type] ?? 0;
    if (p > pBest) best = ev;
  }
  return best.type;
}

function createNewEvent(type) {
  const cfg = EVENT_LIFETIME[type] || {};
  const baseMin = cfg.baseMin ?? 60;
  const baseMax = cfg.baseMax ?? 300;
  return {
    type,
    remainingSeconds: randomInt(baseMin, baseMax),
    extendedCount: 0,
  };
}

/**
 * 🔹 updateEvents: eventsRef.current 배열을 업데이트
 */
function updateEvents(eventsRef, now) {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const isOffHours = hour < 7 || hour >= 20;
  const isWorkHours = hour >= 9 && hour < 18 && !isWeekend;

  let current = eventsRef.current || [];
  const updated = [];

  for (const ev of current) {
    const cfg = EVENT_LIFETIME[ev.type] || {};
    const maxExtensions = cfg.maxExtensions ?? 0;
    const extendProb = cfg.extendProb ?? 0;
    const extraMin = cfg.extraMin ?? 30;
    const extraMax = cfg.extraMax ?? 60;

    const newRemaining = ev.remainingSeconds - 1;

    if (newRemaining > 0) {
      updated.push({ ...ev, remainingSeconds: newRemaining });
      continue;
    }

    if (ev.extendedCount >= maxExtensions || extendProb <= 0) {
      continue;
    }

    if (Math.random() < extendProb) {
      const extra = randomInt(extraMin, extraMax);
      updated.push({
        ...ev,
        remainingSeconds: extra,
        extendedCount: (ev.extendedCount ?? 0) + 1,
      });
    } else {
      // 종료
    }
  }

  const hasEvent = (type) => updated.some((ev) => ev.type === type);

  if (isOffHours) {
    if (!hasEvent(EVENT_TYPES.FIRE) && Math.random() < FIRE_PROB_OFF) {
      updated.push(createNewEvent(EVENT_TYPES.FIRE));
    }
    if (!hasEvent(EVENT_TYPES.OVERTIME) && Math.random() < OVERTIME_PROB_OFF) {
      updated.push(createNewEvent(EVENT_TYPES.OVERTIME));
    }
    if (
      !hasEvent(EVENT_TYPES.LIGHT_LEFT_ON) &&
      Math.random() < LIGHT_LEFT_ON_PROB_OFF
    ) {
      updated.push(createNewEvent(EVENT_TYPES.LIGHT_LEFT_ON));
    }
    if (
      !hasEvent(EVENT_TYPES.WATER_LEAK) &&
      Math.random() < WATER_LEAK_PROB_OFF
    ) {
      updated.push(createNewEvent(EVENT_TYPES.WATER_LEAK));
    }
    if (!hasEvent(EVENT_TYPES.GAS_LEAK) && Math.random() < GAS_LEAK_PROB_OFF) {
      updated.push(createNewEvent(EVENT_TYPES.GAS_LEAK));
    }
    if (
      !hasEvent(EVENT_TYPES.EQUIPMENT_TEST_BOILER) &&
      Math.random() < EQUIPMENT_TEST_PROB_OFF
    ) {
      updated.push(createNewEvent(EVENT_TYPES.EQUIPMENT_TEST_BOILER));
    }
    if (!hasEvent(EVENT_TYPES.CLEANING) && Math.random() < CLEANING_PROB_OFF) {
      updated.push(createNewEvent(EVENT_TYPES.CLEANING));
    }
    if (
      !hasEvent(EVENT_TYPES.POWER_ISSUE) &&
      Math.random() < POWER_ISSUE_PROB_OFF
    ) {
      updated.push(createNewEvent(EVENT_TYPES.POWER_ISSUE));
    }
  }

  if (isWorkHours) {
    if (
      !hasEvent(EVENT_TYPES.CONFERENCE) &&
      Math.random() < CONFERENCE_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.CONFERENCE));
    }
    if (!hasEvent(EVENT_TYPES.TRAINING) && Math.random() < TRAINING_PROB_WORK) {
      updated.push(createNewEvent(EVENT_TYPES.TRAINING));
    }
    if (!hasEvent(EVENT_TYPES.TOUR) && Math.random() < TOUR_PROB_WORK) {
      updated.push(createNewEvent(EVENT_TYPES.TOUR));
    }
    if (
      !hasEvent(EVENT_TYPES.VENTILATION_BOOST) &&
      Math.random() < VENTILATION_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.VENTILATION_BOOST));
    }
    if (
      !hasEvent(EVENT_TYPES.WINDOW_OPEN) &&
      Math.random() < WINDOW_OPEN_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.WINDOW_OPEN));
    }
    if (
      !hasEvent(EVENT_TYPES.EQUIPMENT_OFF) &&
      Math.random() < EQUIPMENT_OFF_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.EQUIPMENT_OFF));
    }
    if (
      !hasEvent(EVENT_TYPES.HVAC_FAULT) &&
      Math.random() < HVAC_FAULT_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.HVAC_FAULT));
    }
    if (
      !hasEvent(EVENT_TYPES.POWER_ISSUE) &&
      Math.random() < POWER_ISSUE_PROB_WORK
    ) {
      updated.push(createNewEvent(EVENT_TYPES.POWER_ISSUE));
    }
  }

  eventsRef.current = updated;
}

/**
 * 🔹 층별 실시간 더미 데이터 생성기
 * - floorIds: ["B2", "B1", "1F", "2F", ...] 같은 층 ID 배열
 * - roomsPerFloor: 층당 방 개수
 * - speed: 1초에 진행할 "가상 초" 개수 (배속)
 */
export default function FakeRealtimeGenerator({
  floorIds = ["1F"],
  roomsPerFloor = 7,
  speed = 1,
}) {
  // 🔹 전체 빌딩 공통 가상 시간
  const simTimeRef = useRef(Date.now());
  const simStepRef = useRef(0);
  const tickRef = useRef(0);

  // 🔹 층별 상태들
  const lastValuesByFloorRef = useRef({});
  const eventsByFloorRef = useRef({});
  const roomStatesByFloorRef = useRef({});
  const lastRoomUpdateStepByFloorRef = useRef({});

  useEffect(() => {
    const floors =
      Array.isArray(floorIds) && floorIds.length > 0 ? floorIds : ["1F"];

    // 초기화
    simTimeRef.current = Date.now();
    simStepRef.current = 0;
    tickRef.current = 0;

    lastValuesByFloorRef.current = {};
    eventsByFloorRef.current = {};
    roomStatesByFloorRef.current = {};
    lastRoomUpdateStepByFloorRef.current = {};

    floors.forEach((f) => {
      lastValuesByFloorRef.current[f] = {
        elec: 2.5,
        water: 0.5,
        gas: 0.8,
        temp: 21.0,
      };
      eventsByFloorRef.current[f] = [];
      roomStatesByFloorRef.current[f] = new Array(roomsPerFloor).fill(false);
      lastRoomUpdateStepByFloorRef.current[f] = 0;
    });

    const timer = setInterval(() => {
      tickRef.current += 1;

      // 한 틱(1초)마다 speed번 가상의 1초 진행
      for (let i = 0; i < speed; i++) {
        simTimeRef.current += 1000;
        simStepRef.current += 1;
        const now = new Date(simTimeRef.current);

        floors.forEach((floor) => {
          // ---- 이벤트 갱신 ----
          const eventsRefObj = {
            current: eventsByFloorRef.current[floor] || [],
          };
          updateEvents(eventsRefObj, now);
          eventsByFloorRef.current[floor] = eventsRefObj.current;
          const activeEvents = eventsByFloorRef.current[floor];

          // ---- 방 상태 재판정 (5분마다) ----
          const lastUpdate = lastRoomUpdateStepByFloorRef.current[floor] ?? 0;
          if (
            simStepRef.current === 1 ||
            simStepRef.current - lastUpdate >=
              ACTIVE_ROOMS_UPDATE_INTERVAL_SECONDS
          ) {
            const targetRatio = getTargetOccupancyRatio(now);
            const prevStates =
              roomStatesByFloorRef.current[floor] &&
              roomStatesByFloorRef.current[floor].length === roomsPerFloor
                ? roomStatesByFloorRef.current[floor]
                : new Array(roomsPerFloor).fill(false);

            const nextStates = [...prevStates];

            for (let idx = 0; idx < roomsPerFloor; idx++) {
              const current = prevStates[idx] === true;

              if (simStepRef.current === 1) {
                nextStates[idx] = Math.random() < targetRatio;
              } else {
                if (current) {
                  const baseStay = 0.7;
                  const pStay = Math.min(
                    0.98,
                    Math.max(0.6, baseStay + targetRatio * 0.2)
                  );
                  nextStates[idx] = Math.random() < pStay;
                } else {
                  const baseOn = 0.05;
                  const pOn = Math.min(
                    0.9,
                    Math.max(0.02, baseOn + targetRatio * 0.8)
                  );
                  nextStates[idx] = Math.random() < pOn;
                }
              }
            }

            roomStatesByFloorRef.current[floor] = nextStates;
            lastRoomUpdateStepByFloorRef.current[floor] = simStepRef.current;
          }

          const states =
            roomStatesByFloorRef.current[floor] &&
            roomStatesByFloorRef.current[floor].length === roomsPerFloor
              ? roomStatesByFloorRef.current[floor]
              : new Array(roomsPerFloor).fill(false);
          const activeRooms = states.reduce((acc, s) => acc + (s ? 1 : 0), 0);

          // ---- per-room baseline + 층 전체 베이스 ----
          const perRoomBase = getBaselines(now);
          const base = {
            temp: perRoomBase.temp,
            elec: perRoomBase.elec * activeRooms,
            water: perRoomBase.water * activeRooms,
            gas: perRoomBase.gas * activeRooms,
          };

          const prev = lastValuesByFloorRef.current[floor] || {
            elec: 2.5,
            water: 0.5,
            gas: 0.8,
            temp: 21.0,
          };

          const target = applyAllEventEffects(base, activeEvents);

          const temp = smoothTowards(prev.temp, target.temp, {
            maxStep: 0.05,
            jitter: 0.02,
            digits: 1,
          });
          const elec = smoothTowards(prev.elec, target.elec, {
            maxStep: 0.3,
            jitter: 0.05,
            digits: 2,
          });
          const water = smoothTowards(prev.water, target.water, {
            maxStep: 0.1,
            jitter: 0.02,
            digits: 2,
          });
          const gas = smoothTowards(prev.gas, target.gas, {
            maxStep: 0.1,
            jitter: 0.02,
            digits: 2,
          });

          lastValuesByFloorRef.current[floor] = { elec, water, gas, temp };

          const mainEventType = getMainEventType(activeEvents);
          const isAlarm = activeEvents.some((ev) => isAlarmEventType(ev.type));
          const mainEvent = activeEvents.find(
            (ev) => ev.type === mainEventType
          );
          const mainEventExtendedCount = mainEvent?.extendedCount ?? 0;

          // 🔹 10초(가상)마다 RTDB 저장
          if (simStepRef.current % SAVE_INTERVAL_SECONDS === 0) {
            saveRoomRealtimeData({
              floor,
              elec,
              water,
              gas,
              temp,
              mainEventType,
              eventTypes: activeEvents.map((ev) => ev.type),
              mainEventExtendedCount,
              isAlarm,
              mode: MODE,
              createdAt: simTimeRef.current,
              speed,
              activeRooms,
              roomsPerFloor,
            }).catch((err) => {
              console.error(`실시간 더미 데이터 저장 실패 (${floor}):`, err);
            });
          }
        });
      }

      // 🔹 60초마다 오래된 초단위 데이터 정리 (시뮬레이션 시간 기준)
      if (tickRef.current % 60 === 0) {
        floors.forEach((floor) => {
          cleanupOldRealtimeSeconds({
            floor,
            keepSeconds: 60 * 60,
            nowTs: simTimeRef.current,
          }).catch((err) => {
            console.error(`초단위 데이터 정리 실패 (${floor}):`, err);
          });
        });
      }

      // 🔹 3600초마다 분단위/시단위 집계 정리 (시뮬레이션 시간 기준)
      if (tickRef.current % 3600 === 0) {
        floors.forEach((floor) => {
          cleanupOldMinuteAggregates({
            floor,
            keepDays: 30,
            nowTs: simTimeRef.current,
          }).catch((err) => {
            console.error(`분단위 집계 정리 실패 (${floor}):`, err);
          });

          cleanupOldHourAggregates({
            floor,
            keepDays: 365,
            nowTs: simTimeRef.current,
          }).catch((err) => {
            console.error(`시간단위 집계 정리 실패 (${floor}):`, err);
          });
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [floorIds, roomsPerFloor, speed]);

  return (
    <div style={{ padding: "8px", fontSize: "13px" }}>
      <strong>실시간 층별 더미 데이터 생성 중 ({MODE} 모드)</strong>
      <div style={{ marginTop: 4 }}>
        층 목록:{" "}
        {Array.isArray(floorIds) && floorIds.length > 0
          ? floorIds.join(", ")
          : "1F"}
      </div>
      <div>
        층당 방 개수: {roomsPerFloor} / 배속: {speed}x
      </div>
      <div style={{ color: "#6b7280", marginTop: 4 }}>
        (10초(가상)마다 층별 전기·수도·가스·온도 데이터를 RTDB에 저장하고,
        <br />
        오래된 초단위/분단위/시단위 데이터는 시뮬레이션 시간 기준으로 주기적으로
        정리합니다.)
      </div>
    </div>
  );
}
