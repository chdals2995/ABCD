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

// ✅ 단가(원) - 필요하면 여기만 바꾸면 됨
const RATE = {
  elec: 160,  // 원/kWh
  gas: 1100,  // 원/m³
  water: 800, // 원/m³
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

function pickUsage(row, metricKey) {
  if (typeof row === "number") return safeNum(row);

  const ev = row?.eventCounts ?? {};
  const map = {
    elec: [row?.elecSum, row?.elecTotal, row?.elecKwh, row?.elec, row?.usage?.elec, row?.sum?.elec],
    gas: [row?.gasSum, row?.gasTotal, row?.gas, row?.usage?.gas, row?.sum?.gas, ev?.gasSum, ev?.gasTotal],
    water: [row?.waterSum, row?.waterTotal, row?.water, row?.usage?.water, row?.sum?.water, ev?.waterSum, ev?.waterTotal],
  };

  const candidates = map[metricKey] ?? [];
  for (const v of candidates) {
    const n = safeNum(v);
    if (n !== 0) return n;
  }
  return 0;
}

/**
 * props:
 * - metricKey / metrickey: "elec" | "gas" | "water"
 * - pathBase: 기본 "aggMonthBuilding"
 * - buildingId: 있으면 aggMonthBuilding/{buildingId}
 * - months: 최근 N개월
 */
export default function EmData({
  metricKey: metricKeyProp,
  metrickey, // ✅ 오타로 넘어와도 대응
  pathBase = "aggMonthBuilding",
  buildingId,
  months = 12,
}) {
  // ✅ 여기 핵심: metricKey는 “prop”으로만 결정
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
          const usage = pickUsage(row, safeMetricKey);
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

  // ✅ 차트 데이터: “만원” 단위로 넣기
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
              return `${formatManWonFromWon(r.costWon)}  (사용량: ${r.usage.toLocaleString()} ${UNIT[safeMetricKey]})`;
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
      {/* 상단 제목만(원하면 여기 디자인 더 맞춰줄게) */}
      <div className="flex items-center gap-4 mt-[20px] ml-[10px]">
        <div className="text-[18px] font-semibold">
          월별 {LABEL_KR[safeMetricKey]} 사용비용 (단위: 만원)
        </div>
      </div>

      {/* 차트 영역 */}
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
