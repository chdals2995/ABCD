// src/components/adminpage/TestEnergyRealtimeChart.jsx
import { useEffect, useRef, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { rtdb } from "../../firebase/config";
import {
  ref,
  query,
  orderByKey,
  limitToLast,
  get,
  onValue,
} from "firebase/database";

const METRIC_LABEL = {
  elec: "전기",
  water: "수도",
  gas: "가스",
};

const METRIC_UNIT = {
  elec: "㎾/h",
  water: "㎥/h",
  gas: "ℓ/h",
};

// 🔹 지표별 선 색상
const METRIC_COLOR = {
  elec: "#FF9130",
  water: "#0004FF",
  gas: "#4F6150",
};

// 🔹 평균선 색상
const AVG_LINE_COLOR = "#B5DCF3";

export default function TestEnergyRealtimeChart() {
  const [metric, setMetric] = useState("elec");

  const [state, setState] = useState({
    loading: true,
    labels: [],
    values: [],
    avgPerHour: null,
    current: 0,
    diffPct: null,
    baseDateKey: null, // 어떤 날짜 기준인지 보기용
  });

  // 🔹 마지막 minuteKey 기억용
  const lastMinuteKeyRef = useRef(null);

  useEffect(() => {
    let unsubscribe;

    lastMinuteKeyRef.current = null;

    async function load() {
      try {
        // 0️⃣ aggMinuteBuilding 루트에서 "가장 최근 날짜" 찾기
        const dateRootRef = ref(rtdb, "aggMinuteBuilding");
        const dateSnap = await get(
          query(dateRootRef, orderByKey(), limitToLast(1))
        );

        if (!dateSnap.exists()) {
          lastMinuteKeyRef.current = null;
          setState({
            loading: false,
            labels: [],
            values: [],
            avgPerHour: null,
            current: 0,
            diffPct: null,
            baseDateKey: null,
          });
          return;
        }

        const [latestDateKey] = Object.entries(dateSnap.val())[0];

        const baseDate = parseDateKey(latestDateKey);
        const yesterdayDate = new Date(
          baseDate.getTime() - 24 * 60 * 60 * 1000
        );
        const yesterdayKey = formatDateKey(yesterdayDate);

        // 1️⃣ 어제 하루 총합 → 평균 /h 구하기 (aggDayBuilding 기준)
        const yesterdaySnap = await get(
          ref(rtdb, `aggDayBuilding/${yesterdayKey}`)
        );
        const yData = (yesterdaySnap.exists() && yesterdaySnap.val()) || {};

        const sumField = `${metric}Sum`; // elecSum / waterSum / gasSum
        const totalYesterday = yData[sumField] ?? 0;
        const avgPerHour = totalYesterday > 0 ? totalYesterday / 24 : null;

        // 2️⃣ "가장 최근 날짜"의 분단위 집계 실시간 구독
        const minuteRef = query(
          ref(rtdb, `aggMinuteBuilding/${latestDateKey}`),
          orderByKey(),
          limitToLast(60) // 최근 60분
        );

        unsubscribe = onValue(
          minuteRef,
          (snap) => {
            if (!snap.exists()) {
              lastMinuteKeyRef.current = null;
              setState({
                loading: false,
                labels: [],
                values: [],
                avgPerHour,
                current: 0,
                diffPct: avgPerHour ? calcDiffPct(0, avgPerHour) : null,
                baseDateKey: latestDateKey,
              });
              return;
            }

            const raw = snap.val() || {};
            const entries = Object.entries(raw).sort(([a], [b]) =>
              a.localeCompare(b)
            );

            if (entries.length === 0) {
              lastMinuteKeyRef.current = null;
              setState({
                loading: false,
                labels: [],
                values: [],
                avgPerHour,
                current: 0,
                diffPct: avgPerHour ? calcDiffPct(0, avgPerHour) : null,
                baseDateKey: latestDateKey,
              });
              return;
            }

            // 🔸 가장 마지막 분 키
            const lastEntry = entries[entries.length - 1];
            const lastMinuteKey = lastEntry[0];

            // ✅ 같은 minuteKey면 무시 → 한 분 안에서는 중간값 안 보여줌
            if (lastMinuteKeyRef.current === lastMinuteKey) {
              return;
            }
            lastMinuteKeyRef.current = lastMinuteKey;

            const labels = entries.map(([minuteKey]) => minuteKey);
            const avgField = `${metric}Avg`; // elecAvg / waterAvg / gasAvg

            const values = entries.map(([_, v]) =>
              round1(v[avgField] ?? v[sumField] ?? 0)
            );

            const current = values.length > 0 ? values[values.length - 1] : 0;
            const diffPct =
              avgPerHour != null ? calcDiffPct(current, avgPerHour) : null;

            setState({
              loading: false,
              labels,
              values,
              avgPerHour,
              current,
              diffPct,
              baseDateKey: latestDateKey,
            });
          },
          (error) => {
            console.error("TestEnergyRealtimeChart onValue error:", error);
            setState((prev) => ({ ...prev, loading: false }));
          }
        );
      } catch (err) {
        console.error("TestEnergyRealtimeChart load error:", err);
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    load();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [metric]);

  const { labels, values, avgPerHour, current, diffPct, loading, baseDateKey } =
    state;

  const chartData = {
    labels,
    datasets: [
      {
        label: "현재 사용량",
        data: values,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        borderColor: METRIC_COLOR[metric], // ✅ 현재 지표 색
      },
      {
        label: "평균 사용량",
        data:
          avgPerHour != null
            ? new Array(labels.length).fill(round1(avgPerHour))
            : [],
        borderWidth: 1,
        pointRadius: 0,
        borderDash: [4, 4],
        borderColor: AVG_LINE_COLOR, // ✅ 평균선 색
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: "실시간" },
        ticks: { maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "단위" },
      },
    },
  };

  return (
    <div className="w-full h-full">
      {/* 상단 텍스트/셀렉트 영역 */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            기준 날짜: {baseDateKey ?? "-"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">지표</span>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="border border-gray-300 rounded-[6px] text-sm px-2 py-[2px] bg-white"
          >
            <option value="elec">전기</option>
            <option value="water">수도</option>
            <option value="gas">가스</option>
          </select>
        </div>

        <div className="text-xs text-right min-w-[150px]">
          {loading ? (
            <span className="text-gray-400">불러오는 중...</span>
          ) : (
            <>
              <span className="font-medium">
                {METRIC_LABEL[metric]}: {round1(current)} {METRIC_UNIT[metric]}
              </span>
              <span className="ml-1 text-gray-500">
                (어제 대비 {formatDiff(diffPct)})
              </span>
            </>
          )}
        </div>
      </div>

      {/* 그래프 영역 */}
      <div className="w-full h-[220px]">
        {labels.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            실시간 데이터가 없습니다.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}

/* ===== 유틸 함수들 ===== */

function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calcDiffPct(now, base) {
  if (!base || base === 0) return null;
  const diff = ((now - base) / base) * 100;
  return Number(diff.toFixed(1));
}

function round1(v) {
  return Number(Number(v).toFixed(1));
}

function formatDiff(pct) {
  if (pct === null || pct === undefined) return "데이터 없음";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}
