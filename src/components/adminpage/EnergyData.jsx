// src/components/adminpage/EnergyData.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, query, orderByKey, limitToLast, get } from "firebase/database";
import EnergyRealtimeChart from "./EnergyRealtimeChart"; // ✅ 그래프 추가

export default function EnergyData() {
  const [data, setData] = useState({
    loading: true,
    powerNow: 0,
    waterNow: 0,
    gasNow: 0,
    powerDiffPct: null,
    waterDiffPct: null,
    gasDiffPct: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const todayKey = formatDateKey(now); // 👉 실제 오늘 날짜
        const yesterdayKey = formatDateKey(yesterday);

        // 1️⃣ 오늘 기준, 가장 마지막 분 데이터 (실시간 느낌 값)
        const latestMinuteQuery = query(
          ref(rtdb, `aggMinuteBuilding/${todayKey}`),
          orderByKey(), // "HH:mm" 키 기준 정렬
          limitToLast(1)
        );

        const latestSnap = await get(latestMinuteQuery);

        let powerNow = 0;
        let waterNow = 0;
        let gasNow = 0;

        if (latestSnap.exists()) {
          const latest = Object.values(latestSnap.val() || {})[0] || {};

          // minute 집계 구조: elecAvg / waterAvg / gasAvg / elecSum / ...
          powerNow = latest.elecAvg ?? latest.elecSum ?? 0;
          waterNow = latest.waterAvg ?? latest.waterSum ?? 0;
          gasNow = latest.gasAvg ?? latest.gasSum ?? 0;
        }

        // 2️⃣ 어제 하루 총 사용량 (aggDayBuilding 기준, 실제 어제 날짜)
        const yesterdaySnap = await get(
          ref(rtdb, `aggDayBuilding/${yesterdayKey}`)
        );
        const yData = (yesterdaySnap.exists() && yesterdaySnap.val()) || {};

        // day 집계 구조: elecSum / waterSum / gasSum ...
        const elecTotalY = yData.elecSum ?? 0;
        const waterTotalY = yData.waterSum ?? 0;
        const gasTotalY = yData.gasSum ?? 0;

        // 24시간 기준 평균 /h (어제)
        const elecAvgY = elecTotalY / 24;
        const waterAvgY = waterTotalY / 24;
        const gasAvgY = gasTotalY / 24;

        const powerDiffPct = calcDiffPct(powerNow, elecAvgY);
        const waterDiffPct = calcDiffPct(waterNow, waterAvgY);
        const gasDiffPct = calcDiffPct(gasNow, gasAvgY);

        setData({
          loading: false,
          powerNow: round1(powerNow),
          waterNow: round1(waterNow),
          gasNow: round1(gasNow),
          powerDiffPct,
          waterDiffPct,
          gasDiffPct,
        });
      } catch (err) {
        console.error("EnergyData load error:", err);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
  }, []);

  return (
    <div className="w-[553px] h-[438px] border-[12px] border-[#054E76] rounded-[10px] bg-white">
      {/* ▽ 세로로 위/아래 나누기 */}
      <div className="flex flex-col h-full p-[22px] gap-4">
        {/* 🔼 위쪽: 텍스트 요약 */}
        <div className="flex justify-between">
          <h1 className="font-bold font-pyeojin text-[25px]">
            건물 전체 상태 요약
          </h1>

          <div className="text-[13px] leading-relaxed text-right">
            {data.loading ? (
              <span className="text-gray-400">데이터 불러오는 중...</span>
            ) : (
              <div className="w-[220px] space-y-1">
                <div className="w-full flex justify-between">
                  <span>전력 : {data.powerNow} ㎾/h </span>
                  <span>(어제 대비 {formatDiff(data.powerDiffPct)})</span>
                </div>

                <div className="w-full flex justify-between">
                  <span>수도 : {data.waterNow} ㎥/h </span>
                  <span>(어제 대비 {formatDiff(data.waterDiffPct)})</span>
                </div>

                <div className="w-full flex justify-between">
                  <span>가스 : {data.gasNow} ℓ/h </span>
                  <span>(어제 대비 {formatDiff(data.gasDiffPct)})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔽 아래쪽: 실시간 그래프 */}
        <div className="flex-1">
          <EnergyRealtimeChart />
        </div>
      </div>
    </div>
  );
}

/* ===== 유틸 함수들 ===== */

// YYYY-MM-DD
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
