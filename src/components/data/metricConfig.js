// src/data/metricConfig.js
export const metricConfig = {
  elec: {
    label: "전력",
    unit: "kWh",
    day: {
      path: "aggDayBuilding",
      sumField: "elecSum",
      limit: 7,
      scale: (raw) => raw,
      y: { min: 0, max: 4000 },
      thresholds: { warn: 2500, danger: 3500 },
      suffix: " kWh",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "elecSum",
      limit: 12,
      scale: (raw) => raw / 10000,
      y: { min: 0, max: 110000 },
      thresholds: { warn: 80000, danger: 90000 },
      suffix: "만 kWh",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "elecAvg",
      minutes: 60,
      thresholds: { warn: 15, danger: 20 },
      y: { min: 0, max: 30}
    },
    chart: {
      bar:  "#FFC107",
      line: "#FFC107",
      warn: "#FF6200",
      danger: "red",
    },
  },

  gas: {
    label: "가스",
    unit: "L/h",
    day: {
      path: "aggDayBuilding",
      sumField: "gasSum",
      limit: 7,
      scale: (raw) => raw,
      y: { min: 0, max: 1000 },
      thresholds: { warn: 700, danger: 850 },
      suffix: " L/h",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "gasSum",
      limit: 12,
      scale: (raw) => (raw / 10000),
      y: { min: 0, max: 10000 },
      thresholds: { warn: 22000, danger: 26000 },
      suffix: "만 L/h",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "gasAvg",
      minutes: 60,
      y: { min: 0, max: 10},
      // 필요하면 여기도 thresholds 추가 가능
      // thresholds: { warn: ??, danger: ?? },
    },
    chart: {
      bar:  "#6AC254",
      line: "#6AC254",
      warn: "#006D31",
      danger: "#5C3824",
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
      suffix: "m³/h",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "waterSum",
      limit: 12,
      scale: (raw) => (raw / 10000),
      y: { min: 0, max: 30000 },
      thresholds: { warn: 22000, danger: 26000 },
      suffix: "만 m³/h",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "waterAvg",
      minutes: 60,
      y: { min: 0, max: 10}
      // thresholds: { warn: ??, danger: ?? },
    },
    chart: {
      bar:  "#6ED8DE",
      line: "#6ED8DE",
      warn: "#3AB7E9",
      danger: "#106EC6",
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
      suffix: "℃",
    },
    month: {
      path: "aggMonthBuilding",
      sumField: "tempAvg",
      limit: 12,
      scale: (raw) => raw,
      y: { min: 0, max: 50 },
      thresholds: { warn: 30, danger: 35 },
      suffix: "℃",
    },
    realtime: {
      path: "aggMinuteBuilding",
      metricField: "tempAvg",
      minutes: 60,
      thresholds: { warn:10 && 30,   danger: 40 },
      y: { min: 0, max: 40}
    },
    chart: {
      bar:  "#B6D453",
      line: "#B6D453",
      warn: "#F8C931",
      danger: "#DE3F3F",
    },
  },
};
