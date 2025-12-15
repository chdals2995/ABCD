// src/data/metricConfig.js

export const metricConfig = {
  elec: {
    label: "전력",
    unit: "kWh",
    day: {
      path: "aggDayBuilding",
      sumField: "elecSum",       // val.elecSum
      limit: 7,
      scale: (raw) => Math.round(raw / 10000), // "만" 단위로 쓰는 경우
      y: { min: 0, max: 4000 },
      thresholds: { warn: 2000, danger: 3500 }, // warn 이상=주의, danger 이상=위험
      suffix: "만", // 테이블에 붙일 단위(원하면 "")
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "elecSum",
      limit: 12,
      scale: (raw) => Math.round(raw / 10000),
      y: { min: 0, max: 110000 },
      thresholds: { warn: 80000, danger: 90000 },
      suffix: "만",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "elecAvg",
      minutes: 60,
    },
  },

  // ⚠️ 아래 3개는 네 RTDB 스키마에 맞게 sumField/metricField만 맞춰주면 됨
  gas: {
    label: "가스",
    unit: "ℓ/h",
    day: {
      path: "aggDayBuilding",
      sumField: "gasSum",
      limit: 7,
      scale: (raw) => raw, // 가스는 "만" 안 쓰면 그대로
      y: { min: 0, max: 1000 },
      thresholds: { warn: 700, danger: 850 },
      suffix: "",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "gasSum",
      limit: 12,
      scale: (raw) => raw,
      y: { min: 0, max: 30000 },
      thresholds: { warn: 22000, danger: 26000 },
      suffix: "",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "gasAvg",
      minutes: 60,
    },
  },

  water: {
    label: "수도",
    unit: "㎥/h",
    day: {
      path: "aggDayBuilding",
      sumField: "waterSum",
      limit: 7,
      scale: (raw) => raw,
      y: { min: 0, max: 1000 },
      thresholds: { warn: 700, danger: 850 },
      suffix: "",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "waterSum",
      limit: 12,
      scale: (raw) => raw,
      y: { min: 0, max: 30000 },
      thresholds: { warn: 22000, danger: 26000 },
      suffix: "",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "waterAvg",
      minutes: 60,
    },
  },

  temp: {
    label: "온도",
    unit: "℃",
    day: {
      path: "aggDayBuilding",
      sumField: "tempAvg",
      limit: 7,
      scale: (raw) => raw,
      y: { min: 0, max: 50 },
      thresholds: { warn: 30, danger: 35 },
      suffix: "",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "tempAvg",
      limit: 12,
      scale: (raw) => raw,
      y: { min: 0, max: 50 },
      thresholds: { warn: 30, danger: 35 },
      suffix: "",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "tempAvg",
      minutes: 60,
    },
  },
};
