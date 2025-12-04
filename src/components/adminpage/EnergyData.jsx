// src/components/EnergyData.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import {
  ref,
  query,
  orderByChild,
  limitToLast,
  get,
} from "firebase/database";

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
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const todayKey = formatDateKey(now);       // "2025-12-04"
        const yesterdayKey = formatDateKey(yesterday);

        // 1️⃣ 오늘 최신 분 데이터 (실시간 느낌 값)
        const latestMinuteQuery = query(
          ref(rtdb, `aggMinuteBuilding/${todayKey}`), // 🔹 BUILDING_ID 없음
          orderByChild("createdAt"),
          limitToLast(1)
        );

        const latestSnap = await get(latestMinuteQuery);

        let powerNow = 0;
        let waterNow = 0;
        let gasNow = 0;

        if (latestSnap.exists()) {
          latestSnap.forEach((child) => {
            const v = child.val() || {};
            // 👉 실제 필드 이름에 맞게 수정 (예: elec, water, gas)
            powerNow = v.elec ?? 0;
            waterNow = v.water ?? 0;
            gasNow = v.gas ?? 0;
          });
        }

        // 2️⃣ 어제 하루 총 사용량 (aggDay 기준, 건물 하나라서 ID 없이)
        const yesterdaySnap = await get(
          ref(rtdb, `aggDayBuilding/${yesterdayKey}`) // 🔹 BUILDING_ID 없음
        );
        const yData = yesterdaySnap.val() || {};

        // 👉 실제 필드 이름에 맞게 수정
        const elecTotalY = yData.elecTotal ?? 0;
        const waterTotalY = yData.waterTotal ?? 0;
        const gasTotalY = yData.gasTotal ?? 0;

        // 24시간 기준 평균 /h
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
      <div className="flex justify-between p-[22px] h-full">
        <h1 className="font-bold font-pyeojin text-[20px]">
          건물 전체 상태 요약
        </h1>

        <div className="text-[13px] leading-relaxed text-right">
          {data.loading ? (
            <span className="text-gray-400">데이터 불러오는 중...</span>
          ) : (
            <>
              <span>
                전력 : {data.powerNow} ㎾/h (어제 대비{" "}
                {formatDiff(data.powerDiffPct)})
              </span>
              <br />
              <span>
                수도 : {data.waterNow} ㎥/h (어제 대비{" "}
                {formatDiff(data.waterDiffPct)})
              </span>
              <br />
              <span>
                가스 : {data.gasNow} ℓ/h (어제 대비{" "}
                {formatDiff(data.gasDiffPct)})
              </span>
            </>
          )}
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

// 어제 대비 % 계산
function calcDiffPct(now, base) {
  if (!base || base === 0) return null;
  const diff = ((now - base) / base) * 100;
  return Number(diff.toFixed(1)); // 소수 1자리
}

// 소수 1자리로 정리
function round1(v) {
  return Number(Number(v).toFixed(1));
}

// 퍼센트 표시 포맷
function formatDiff(pct) {
  if (pct === null || pct === undefined) return "데이터 없음";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}
