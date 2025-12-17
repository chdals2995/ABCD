//src/components/data/allData/MaxData
import { useEffect, useMemo, useState } from "react";
import { get, ref } from "firebase/database";
import { rtdb } from "../../../firebase/config";
import { useMaxUsageCard } from "../../../hooks/dataPage/useMaxUsageCard";

/**
 * ✅ 한 컴포넌트로 전기/가스/수도/온도 MaxData 처리
 * 사용:
 *  <MaxData metricKey="elec" />
 *  <MaxData metricKey="gas" />
 *  <MaxData metricKey="water" />
 *  <MaxData metricKey="temp" />
 */

// -------------------- Config --------------------
const MAXDATA_CONFIG = {
  elec: {
    kind: "usage",
    title: "전기 최대 사용량",
    sumField: "elecSum",
    unit: "kWh",
    valueScale: (v) => v,
  },
  gas: {
    kind: "usage",
    title: "가스 최대 사용량",
    sumField: "gasSum",
    unit: "m³",
    valueScale: (v) => v,
  },
  water: {
    kind: "usage",
    title: "수도 최대 사용량",
    sumField: "waterSum",
    unit: "m³",
    valueScale: (v) => v,
  },

  // ✅ 외부 온도 없음: 내부 온도만 사용
  temp: {
    kind: "temp",
    title: "온도",
    dayBuildingPath: "aggDayBuilding",
    monthBuildingPath: "aggMonthBuilding",
    insideDayField: "tempAvg",     // ✅ 너희 내부 온도 필드명으로 수정
    insideMonthField: "tempAvg",   // ✅ 월도 동일하면 그대로
    valueScale: (v) => v,
  },
};

// -------------------- Small helpers --------------------
function fmt(n) {
  const v = Number(n ?? 0);
  return Number.isFinite(v) ? v.toLocaleString() : "0";
}
function fmtDelta(n) {
  const v = Number(n ?? 0);
  const sign = v >= 0 ? "+" : "-";
  return `${sign} ${fmt(Math.abs(v))}`;
}

// 온도 표시
function fmtTemp(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "0°C";
  return `${n.toFixed(1)}°C`;
}
function fmtSignedTemp(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "+0°C";
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${Math.abs(n).toFixed(1)}°C`;
}

// ---- KST helpers ----
function toKstDate(d = new Date()) {
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
}
function getDateKeyKST(d = new Date()) {
  return toKstDate(d).toISOString().slice(0, 10);
}
function getMonthKeyKST(d = new Date()) {
  return toKstDate(d).toISOString().slice(0, 7);
}
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function addMonths(d, months) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}
function safeNum(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

// -------------------- Public component --------------------
export default function MaxData({
  metricKey = "elec",
  borderOpacity = 20,

  // (옵션) usage 쪽 경로/Top3 기준 override
  dayBuildingPath = "aggDayBuilding",
  monthBuildingPath = "aggMonthBuilding",
  hourBuildingPath = "aggHourBuilding",
  placeKeysPath = "floors",
  dayPerPlacePath = "aggDay",
} = {}) {
  const cfg = MAXDATA_CONFIG[metricKey];

  const borderClass =
    borderOpacity === 20 ? "border-[#054E76]/20" : "border-[#054E76]/30";

  if (!cfg) {
    return (
      <div className={`w-full h-full bg-white border ${borderClass} p-5`}>
        <div className="text-[14px] text-gray-500">
          알 수 없는 metricKey: {String(metricKey)}
        </div>
      </div>
    );
  }

  // ✅ 훅 호출 순서 문제 방지: 분기 렌더는 자식 컴포넌트로
  if (cfg.kind === "temp") {
    return <TempMaxCard cfg={cfg} borderClass={borderClass} />;
  }

  return (
    <UsageMaxCard
      cfg={cfg}
      borderClass={borderClass}
      dayBuildingPath={dayBuildingPath}
      monthBuildingPath={monthBuildingPath}
      hourBuildingPath={hourBuildingPath}
      placeKeysPath={placeKeysPath}
      dayPerPlacePath={dayPerPlacePath}
    />
  );
}

// -------------------- Usage (전기/가스/수도) --------------------
function UsageMaxCard({
  cfg,
  borderClass,
  dayBuildingPath,
  monthBuildingPath,
  hourBuildingPath,
  placeKeysPath,
  dayPerPlacePath,
}) {
  const {
    loading,
    todayKey,
    monthKey,
    todayValue,
    monthValue,
    deltaMonth,
    deltaDay,
    peakRange,
    topPlaces,
  } = useMaxUsageCard({
    sumField: cfg.sumField,
    unit: cfg.unit,
    valueScale: cfg.valueScale ?? ((v) => v),
    dayBuildingPath,
    monthBuildingPath,
    hourBuildingPath,
    placeKeysPath,
    dayPerPlacePath,
    topN: 3,
  });

  if (loading) {
    return (
      <div className={`w-full h-full bg-white border ${borderClass} p-5`}>
        <div className="text-[20px] font-bold mb-3">{cfg.title}</div>
        <div className="text-[14px] text-gray-500">로딩중...</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-white border ${borderClass} p-5`}>
      <div className="text-[20px] font-bold text-black mb-3">{cfg.title}</div>

      <div className="text-[18px] font-normal text-black leading-[1.55]">
        <div>
          금일 사용량:{fmt(todayValue)}
          {cfg.unit} <span className="text-[12px]">({todayKey})</span>
        </div>
        <div>
          금월 누적 : {fmt(monthValue)}
          {cfg.unit} <span className="text-[12px]">({monthKey})</span>
        </div>
        <div>
          전월 대비 : {fmtDelta(deltaMonth)}
          {cfg.unit}
        </div>
        <div>
          전일 대비 : {fmtDelta(deltaDay)}
          {cfg.unit}
        </div>
        <div>피크시간 : {peakRange || "없음"}</div>
      </div>

      <div className="mt-6">
        <div className="text-[18px] font-bold mb-2">금일 층별 사용량 top3</div>
        {topPlaces.length === 0 ? (
          <div className="text-[14px] text-gray-500">데이터 없음</div>
        ) : (
          <ol className="text-[18px] font-normal list-decimal pl-6 space-y-1">
            {topPlaces.map((it, idx) => (
              <li key={`${it.key}-${idx}`}>
                {it.key} <span className="text-[12px]">({todayKey})</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// -------------------- Temp (온도: 내부만) --------------------
function TempMaxCard({ cfg, borderClass }) {
  const todayKey = useMemo(() => getDateKeyKST(new Date()), []);
  const ydayKey = useMemo(() => getDateKeyKST(addDays(new Date(), -1)), []);
  const monthKey = useMemo(() => getMonthKeyKST(new Date()), []);
  const prevMonthKey = useMemo(() => getMonthKeyKST(addMonths(new Date(), -1)), []);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    inToday: 0,
    inMonth: 0,
    deltaDay: 0,          // 전일 대비(내부 기준)
    deltaVsPrevMonth: 0,  // 전월 대비(내부 기준)
  });

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      setLoading(true);
      try {
        const [todaySnap, ydaySnap, monthSnap, prevMonthSnap] = await Promise.all([
          get(ref(rtdb, `${cfg.dayBuildingPath}/${todayKey}`)),
          get(ref(rtdb, `${cfg.dayBuildingPath}/${ydayKey}`)),
          get(ref(rtdb, `${cfg.monthBuildingPath}/${monthKey}`)),
          get(ref(rtdb, `${cfg.monthBuildingPath}/${prevMonthKey}`)),
        ]);

        const todayVal = todaySnap.val() || {};
        const ydayVal = ydaySnap.val() || {};
        const monthVal = monthSnap.val() || {};
        const prevMonthVal = prevMonthSnap.val() || {};

        const scale = cfg.valueScale ?? ((v) => v);

        const inToday = safeNum(scale(safeNum(todayVal?.[cfg.insideDayField])));
        const inYday = safeNum(scale(safeNum(ydayVal?.[cfg.insideDayField])));
        const inMonth = safeNum(scale(safeNum(monthVal?.[cfg.insideMonthField])));
        const inPrevMonth = safeNum(scale(safeNum(prevMonthVal?.[cfg.insideMonthField])));

        const next = {
          inToday,
          inMonth,
          deltaDay: inToday - inYday,
          deltaVsPrevMonth: inMonth - inPrevMonth,
        };

        if (!mounted) return;
        setData(next);
      } catch (e) {
        console.error("[TempMaxCard] error:", e);
        if (mounted) setData({ inToday: 0, inMonth: 0, deltaDay: 0, deltaVsPrevMonth: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [cfg, todayKey, ydayKey, monthKey, prevMonthKey]);

  if (loading) {
    return (
      <div className={`w-full h-full bg-white border ${borderClass} p-5`}>
        <div className="text-[20px] font-bold mb-3">온도</div>
        <div className="text-[14px] text-gray-500">로딩중...</div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-white border ${borderClass} p-5`}>
      <div className="text-[20px] font-bold text-black mb-2">금일 건물 내부 온도</div>

      <div className="text-[18px] font-normal text-black leading-[1.55]">
        <div>
          내부 평균 온도 : {fmtTemp(data.inToday)}{" "}
          <span className="text-[12px]">({todayKey})</span>
        </div>
        <div>전일 대비 변화 : {fmtSignedTemp(data.deltaDay)}</div>
      </div>

      <div className="mt-6">
        <div className="text-[20px] font-bold text-black mb-2">📌 이번 달 온도 요약</div>

        <div className="text-[18px] font-normal text-black leading-[1.55]">
          <div>
            내부 평균 온도 : {fmtTemp(data.inMonth)}{" "}
            <span className="text-[12px]">({monthKey})</span>
          </div>
        </div>

        <div className="text-[18px] font-normal text-black mt-6">
          전월 대비 변화 : {fmtSignedTemp(data.deltaVsPrevMonth)}
        </div>
      </div>
    </div>
  );
}
