// /src/components/data/allData/EmData.jsx
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue, query, orderByKey, limitToLast } from "firebase/database";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ✅ 단가(원)
const RATE = {
  elec: 160,   // 원/kWh
  gas: 1100,   // 원/m³
  water: 800,  // 원/m³
};

const LABEL_KR = { elec: "전력", gas: "가스", water: "수도" };
const UNIT = { elec: "kWh", gas: "m³", water: "m³" };

function safeNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toManWon(won) {
  return safeNum(won) / 10000; // ✅ 만원 단위
}
function formatManWonFromWon(won) {
  return `${toManWon(won).toFixed(1)}만원`;
}

function daysInMonth(ym) {
  const [y, m] = String(ym).split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function hoursInMonth(ym) {
  return daysInMonth(ym) * 24;
}

// ✅ (추정) L/min 평균 -> 월 누적 m³
function avgLminToM3PerMonth(avgLmin, ym) {
  const minutes = 60 * 24 * daysInMonth(ym);
  return (safeNum(avgLmin) * minutes) / 1000; // L -> m³
}

// ✅ (추정) kW 평균 -> 월 누적 kWh
function avgKWToKWhPerMonth(avgKW, ym) {
  return safeNum(avgKW) * hoursInMonth(ym); // kW * h = kWh
}

// 첫 번째로 "유효한 숫자" 뽑기(0도 허용)
function firstFinite(cands) {
  for (const v of cands) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

// ✅ sum(합) 후보들
function pickSum(row, metricKey) {
  if (typeof row === "number") return safeNum(row);

  const ev = row?.eventCounts ?? {};
  const map = {
    elec: [
      row?.elecSum, row?.elecTotal, row?.elecKwh, row?.elec,
      row?.usage?.elec, row?.sum?.elec,
      ev?.elecSum, ev?.elecTotal,
    ],
    gas: [
      row?.gasSum, row?.gasTotal, row?.gas,
      row?.usage?.gas, row?.sum?.gas,
      ev?.gasSum, ev?.gasTotal,
    ],
    water: [
      row?.waterSum, row?.waterTotal, row?.water,
      row?.usage?.water, row?.sum?.water,
      ev?.waterSum, ev?.waterTotal,
    ],
  };
  return safeNum(firstFinite(map[metricKey] ?? []));
}

// ✅ count(샘플 개수) 후보들
function pickCount(row) {
  if (!row || typeof row === "number") return 0;
  return safeNum(
    firstFinite([
      row?.count,
      row?.sampleCount,
      row?.samples,
      row?.eventCounts?.count,
    ])
  );
}

// ✅ 핵심: "내가 추정한 단위" 기준으로 월 사용량 산출
function computeMonthlyUsage(month, row, metricKey) {
  const sum = pickSum(row, metricKey);
  const count = pickCount(row);

  // count가 있으면: sum/count 로 평균을 만들고 -> 월 누적으로 환산
  if (count > 0) {
    if (metricKey === "elec") {
      const avgKW = sum / count;               // ✅ 평균 kW(추정)
      return avgKWToKWhPerMonth(avgKW, month); // ✅ 월 kWh
    }
    if (metricKey === "water" || metricKey === "gas") {
      const avgLmin = sum / count;             // ✅ 평균 L/min(추정)
      return avgLminToM3PerMonth(avgLmin, month); // ✅ 월 m³
    }
  }

  // count가 없다면: 이미 "월 사용량"으로 저장된 걸로 보고 그대로 사용 (fallback)
  return sum;
}

export default function EmData({
  metricKey: metricKeyProp,
  metrickey,
  pathBase = "aggMonthBuilding",
  buildingId,
  months = 12,
}) {
  const metricKey = (metricKeyProp ?? metrickey ?? "elec").toLowerCase();
  const safeMetricKey = ["elec", "gas", "water"].includes(metricKey) ? metricKey : "elec";

  const [rows, setRows] = useState([]); // [{ month:'YYYY-MM', usage, costWon }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const basePath = buildingId ? `${pathBase}/${buildingId}` : pathBase;
    const q = query(ref(rtdb, basePath), orderByKey(), limitToLast(months));

    const unsub = onValue(
      q,
      (snap) => {
        const val = snap.val();
        if (!val) {
          setRows([]);
          setLoading(false);
          return;
        }

        const entries = Object.entries(val)
          .filter(([k]) => /^\d{4}-\d{2}$/.test(k)) // YYYY-MM
          .sort(([a], [b]) => a.localeCompare(b));

        const rate = RATE[safeMetricKey] ?? 1;

        const next = entries.map(([month, row]) => {
          const usage = computeMonthlyUsage(month, row, safeMetricKey);
          const costWon = usage * rate;
          return { month, usage, costWon };
        });

        setRows(next);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [safeMetricKey, pathBase, buildingId, months]);

  const chartData = useMemo(() => {
    return {
      labels: rows.map((r) => r.month),
      datasets: [
        {
          label: `${LABEL_KR[safeMetricKey]} 사용비용(만원)`,
          data: rows.map((r) => Number(toManWon(r.costWon).toFixed(1))),
        },
      ],
    };
  }, [rows, safeMetricKey]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              const r = rows[i];
              if (!r) return "";
              const usageStr = Number(r.usage ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
              return `${formatManWonFromWon(r.costWon)} (사용량: ${usageStr} ${UNIT[safeMetricKey]})`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => `${Number(v).toLocaleString()}만원`,
          },
        },
      },
    };
  }, [rows, safeMetricKey]);

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      <div className="flex items-center gap-4 mt-[20px] ml-[10px]">
        <div className="text-[18px] font-semibold">
          월별 {LABEL_KR[safeMetricKey]} 사용비용 (단위: 만원)
        </div>
      </div>

      <div className="absolute left-0 right-0 top-[70px] bottom-0 p-4">
        <div className="w-full h-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              불러오는 중...
            </div>
          ) : rows.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              월별 데이터가 없습니다. (RTDB 경로/키 확인 필요)
            </div>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}
