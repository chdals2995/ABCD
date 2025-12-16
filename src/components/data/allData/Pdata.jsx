//src/components/data/allData/Pdata.jsx
import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MIN_SELECTED = 2; // ✅ 최소 3개
const MAX_SELECTED = 6; // ✅ 최대 6개 (remainder는 별도 자동 계산)

function randInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function formatNum(n) {
  const v = Number(n ?? 0);
  return Number.isFinite(v) ? v.toLocaleString() : "0";
}

function pickTextColor(hex) {
  const c = String(hex || "").replace("#", "");
  if (c.length !== 6) return "#000000";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y < 140 ? "#FFFFFF" : "#000000";
}

// ✅ 메트릭별 항목/범위/색
const METRIC_MAP = {
  elec: {
    title: "항목별 전력 사용 비율",
    items: [
      { label: "냉난방", min: 30, max: 40, color: "#E8FA63" },
      { label: "주차장", min: 15, max: 20, color: "#E54138" },
      { label: "승강기", min: 5, max: 8, color: "#F3D21B" },
    ],
    remainder: { label: "대기전력", color: "#F5FFAC" },
  },
  gas: {
    title: "항목별 가스 사용 비율",
    items: [
      { label: "보일러", min: 35, max: 50, color: "#0B6A3D" },
      { label: "온수", min: 20, max: 30, color: "#9E8364" },
      { label: "주방", min: 10, max: 15, color: "#6D5E45" },
    ],
    remainder: { label: "기타", color: "#A2A8A3" },
  },
  water: {
    title: "항목별 수도 사용 비율",
    items: [
      { label: "화장실", min: 25, max: 35, color: "#6ED8DE" },
      { label: "주방", min: 10, max: 15, color: "#106EC6" },
      { label: "샤워장", min: 20, max: 25, color: "#3AB7E9" },
    ],
    remainder: { label: "기타", color: "#DAF4FF" },
  },
};

// ✅ 항목 설정에서 “추가” 목록으로 쓸 후보(원하면 여기만 바꾸면 됨)
const EXTRA_POOL = {
  elec: [
    { label: "환기", min: 2, max: 6, color: "#B9FBC0" },
    { label: "공용조명", min: 3, max: 8, color: "#FFF59D" },
    { label: "서버실", min: 3, max: 9, color: "#FFCC80" },
  ],
  gas: [
    { label: "난방보조", min: 2, max: 8, color: "#5AAE8A" },
    { label: "세탁", min: 2, max: 6, color: "#B49A7A" },
    { label: "공용", min: 2, max: 6, color: "#8C8F8E" },
  ],
  water: [
    { label: "세탁실", min: 2, max: 8, color: "#8FE6FF" },
    { label: "청소", min: 2, max: 6, color: "#57D0FF" },
    { label: "조경", min: 2, max: 7, color: "#B7F3FF" },
  ],
};

const UNIT_MAP = {
  elec: "kWh",
  gas: "m³",
  water: "m³",
};
// ✅ metricKey별 버튼 테마
const THEME = {
  elec: {
    configBtn: "bg-[#FFF1A8] hover:bg-[#FFE46B] text-black",
    periodBase: {
      day: "bg-[#FFE46B] text-black",
      month: "bg-[#F3D21B] text-black",
      year: "bg-[#E54138] text-white",
    },
  },
  gas: {
    configBtn: "bg-[#CFEEDD] hover:bg-[#A9E0C6] text-black",
    periodBase: {
      day: "bg-[#A9E0C6] text-black",
      month: "bg-[#5AAE8A] text-white",
      year: "bg-[#0B6A3D] text-white",
    },
  },
  water: {
    configBtn: "bg-[#CFEAFF] hover:bg-[#9FD6FF] text-black",
    periodBase: {
      day: "bg-[#9FD6FF] text-black",
      month: "bg-[#3AB7E9] text-white",
      year: "bg-[#106EC6] text-white",
    },
  },
};


function makeTotal(metricKey, period) {
  const key = metricKey in UNIT_MAP ? metricKey : "gas";
  const ranges = {
    elec: { day: [1200, 4500], month: [25000, 120000], year: [300000, 1500000] },
    gas: { day: [80, 250], month: [1500, 7000], year: [20000, 90000] },
    water: { day: [60, 200], month: [1200, 6000], year: [15000, 80000] },
  };
  const [min, max] = ranges[key][period];
  return randInt(min, max);
}

// ✅ 선택된 항목만으로 비율 생성 + remainder로 100 맞춤
function buildSeries(metricKey, selectedDefs, period) {
  const cfg = METRIC_MAP[metricKey] ?? METRIC_MAP.gas;

  let items = selectedDefs?.length ? selectedDefs : cfg.items;
  if (items.length < MIN_SELECTED) items = cfg.items.slice(0, MIN_SELECTED);

  const labels = items.map((it) => it.label);
  const colors = items.map((it) => it.color);
  const mins = items.map((it) => Math.max(0, Number(it.min ?? 0)));
  const maxs = items.map((it, i) => Math.max(mins[i], Number(it.max ?? mins[i])));

  // ✅ 1) 우선 min~max 사이로 랜덤 뽑기
  let values = items.map((_, i) => randInt(mins[i], maxs[i]));

  // ✅ 2) 합이 100 넘으면 “min보다 큰 애들”에서 랜덤으로 1씩 깎기
  let sum = values.reduce((a, b) => a + b, 0);
  let excess = sum - 100;

  while (excess > 0) {
    const reducibles = values
      .map((v, i) => ({ i, room: v - mins[i] }))
      .filter((x) => x.room > 0);

    if (reducibles.length === 0) break;

    const pick = reducibles[randInt(0, reducibles.length - 1)];
    values[pick.i] -= 1;
    excess -= 1;
  }

  sum = values.reduce((a, b) => a + b, 0);
  const remainderVal = Math.max(0, 100 - sum);

  const series = labels.map((label, i) => ({
    label,
    value: values[i],
    color: colors[i],
  }));

  series.push({
    label: cfg.remainder.label,
    value: remainderVal,
    color: cfg.remainder.color,
  });

  return { title: cfg.title, series: series.filter((s) => s.value > 0) };
}

// ✅ 파이 내부 라벨(라벨 + %)
const insideLabelPlugin = {
  id: "insideLabelPlugin",
  afterDatasetDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;

    const labels = chart.data.labels || [];
    const data = chart.data.datasets?.[0]?.data || [];
    const colors = chart.data.datasets?.[0]?.backgroundColor || [];

    ctx.save();
    meta.data.forEach((arc, i) => {
      const v = Number(data[i] ?? 0);
      if (v < 6) return;

      const pos = arc.tooltipPosition();
      const label = String(labels[i] ?? "");
      const color = Array.isArray(colors) ? String(colors[i] ?? "#FFFFFF") : "#FFFFFF";

      ctx.fillStyle = pickTextColor(color);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "600 16px sans-serif";
      ctx.fillText(label, pos.x, pos.y - 10);

      ctx.font = "400 14px sans-serif";
      ctx.fillText(`${v}%`, pos.x, pos.y + 10);
    });
    ctx.restore();
  },
};

export default function Pdata(props) {
const metricKey = (props.metricKey ?? props.metrickey ?? "gas").toLowerCase();
const safeMetricKey = metricKey in METRIC_MAP ? metricKey : "gas";
const unit = UNIT_MAP[safeMetricKey] ?? "";
const theme = THEME[safeMetricKey] ?? THEME.gas;


  const [period, setPeriod] = useState("day");
  const [openConfig, setOpenConfig] = useState(false);

  // ✅ “항목(선택)” 라벨 목록
  const [selectedLabels, setSelectedLabels] = useState([]);

  // ✅ 차트 상태
  const [title, setTitle] = useState(METRIC_MAP.gas.title);
  const [series, setSeries] = useState([]);
  const [total, setTotal] = useState(0);

  // ✅ metric별 전체 후보(기본 + 추가풀) 생성
  const masterItems = useMemo(() => {
    const base = METRIC_MAP[safeMetricKey].items;
    const extras = EXTRA_POOL[safeMetricKey] ?? [];
    const map = new Map();
    [...base, ...extras].forEach((it) => map.set(it.label, it)); // 라벨 중복 방지
    return Array.from(map.values());
  }, [safeMetricKey]);

  const itemMap = useMemo(() => {
    const m = new Map();
    masterItems.forEach((it) => m.set(it.label, it));
    return m;
  }, [masterItems]);

  // ✅ metric 바뀌면 기본 항목으로 초기화
  useEffect(() => {
    const baseLabels = METRIC_MAP[safeMetricKey].items.map((x) => x.label).slice(0, MAX_SELECTED);
    // 최소 3개 보장
    const init = baseLabels.length >= MIN_SELECTED ? baseLabels : baseLabels.concat([]);
    setSelectedLabels(init);
    setOpenConfig(false);
  }, [safeMetricKey]);

  // ✅ 선택/기간/metric 변하면 차트 재생성
  useEffect(() => {
    const selectedDefs = selectedLabels.map((lb) => itemMap.get(lb)).filter(Boolean);
    const { title: t, series: s } = buildSeries(safeMetricKey, selectedDefs, period);

    setTitle(t);
    setSeries(s);
    setTotal(makeTotal(safeMetricKey, period));
  }, [safeMetricKey, period, selectedLabels, itemMap]);

  const availableLabels = useMemo(() => {
    const setSel = new Set(selectedLabels);
    return masterItems.map((it) => it.label).filter((lb) => !setSel.has(lb));
  }, [masterItems, selectedLabels]);

  const canAddMore = selectedLabels.length < MAX_SELECTED;
  const canRemoveMore = selectedLabels.length > MIN_SELECTED;

  const addToSelected = (label) => {
    if (!canAddMore) return;
    if (selectedLabels.includes(label)) return;
    setSelectedLabels((prev) => [...prev, label]);
  };

  const removeFromSelected = (label) => {
    if (!canRemoveMore) return;
    setSelectedLabels((prev) => prev.filter((x) => x !== label));
  };

  const chartData = useMemo(() => {
    return {
      labels: series.map((s) => s.label),
      datasets: [
        {
          data: series.map((s) => s.value),
          backgroundColor: series.map((s) => s.color),
          borderWidth: 0,
        },
      ],
    };
  }, [series]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pct = Number(ctx.parsed ?? 0);
              const abs = Math.round((total * pct) / 100);
              return `${ctx.label}: ${pct}% (${formatNum(abs)} ${unit})`;
            },
          },
        },
      },
    };
  }, [total, unit]);

  const pillClass = (p) => `
  w-[92px] h-[44px] rounded-full shadow
  flex items-center justify-center text-[20px] font-normal
  ${theme.periodBase?.[p] ?? "bg-[rgba(193,195,193,0.8)] text-black"}
  ${period === p ? "ring-2 ring-black" : "opacity-90 hover:opacity-100"}
`;




  return (
    <div className="w-full h-full bg-[#FFFFFF] relative overflow-hidden">
      {/* 상단: 타이틀 + 항목 설정 */}
      <div className="flex items-center gap-3 mt-[20px] ml-[10px]">
        <div className="text-[18px] font-semibold">(건물){title}</div>

        <button
          type="button"
          onClick={() => setOpenConfig(true)}
          className={`text-[18px] font-normal rounded-[10px] px-3 py-1 ${theme.configBtn}`}


        >
          항목 설정
        </button>
      </div>

      {/* 파이차트 */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[70px] w-[260px] h-[260px]">
        <Pie data={chartData} options={options} plugins={[insideLabelPlugin]} />
      </div>

      {/* 오른쪽: 기간 버튼 */}
      <div className="absolute right-4 top-6 text-[14px] leading-6 text-black">
        <div className="mt-3 flex flex-col items-end gap-2">
          <button type="button" onClick={() => setPeriod("day")} className={pillClass("day")}>
  (단위)일
</button>
<button type="button" onClick={() => setPeriod("month")} className={pillClass("month")}>
  (단위)월
</button>
<button type="button" onClick={() => setPeriod("year")} className={pillClass("year")}>
  (단위)연
</button>


        </div>
      </div>

      {/* ✅ 항목 설정 모달 */}
      {openConfig && (
        <div
          className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-[70px]"
          onMouseDown={(e) => {
            // 바깥 클릭 닫기
            if (e.target === e.currentTarget) setOpenConfig(false);
          }}
        >
          <div className="w-[280px] rounded-[16px] overflow-hidden shadow-lg bg-[#ffffff] mt-[-40px] z-50">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#ffffff]">
              <div className="text-[18px] font-semibold text-black">항목</div>
              <button
                type="button"
                onClick={() => setOpenConfig(false)}
                className="text-[18px] leading-none"
              >
                ×
              </button>
            </div>

            {/* 상단 탭(추가 / 항목) */}
            <div className="grid grid-cols-2 text-center bg-[#90deff] text-[#000000]">
              <div className="py-3 text-[18px] font-semibold">추가하기</div>
              <div className="py-3 text-[18px] font-semibold border-l border-black/40">추가된 항목</div>
            </div>

            {/* 리스트 */}
            <div className="grid grid-cols-2 overflow-y h-[230px]">
              {/* 왼쪽: 추가(available) */}
              <div className="py-[5px]">
                <div className="max-h-[260px] overflow-auto space-y-2">
                  {availableLabels.map((lb) => (
                    <button
                      key={lb}
                      type="button"
                      onClick={() => addToSelected(lb)}
                      disabled={!canAddMore}
                      className={`w-full py-2 rounded-md text-[18px]
                        ${canAddMore ? "hover:bg-white/40" : "opacity-40 cursor-not-allowed"}
                      `}
                    >
                      {lb}+
                    </button>
                  ))}

                  {availableLabels.length === 0 && (
                    <div className="text-center text-[14px] text-black/60 py-6">
                      추가할 항목 없음
                    </div>
                  )}
                </div>

                {!canAddMore && (
                  <div className="mt-2 text-[12px] text-black/60 text-center">
                    최대 {MAX_SELECTED}개까지 선택 가능
                  </div>
                )}
              </div>


              

              {/* 오른쪽: 항목(selected) */}
              <div className=" border-l py-[5px] border-black/40">
                <div className="max-h-[225px] overflow-auto space-y-2 overflow-y">
                  {selectedLabels.map((lb) => (
                    <button
                      key={lb}
                      type="button"
                      onClick={() => removeFromSelected(lb)}
                      disabled={!canRemoveMore}
                      className={`w-full py-2 rounded-md text-[18px]
                        ${canRemoveMore ? "hover:bg-white/40" : "cursor-not-allowed"}
                      `}
                    >
                      {lb}-
                    </button>
                  ))}
                </div>

                {!canRemoveMore && (
                  <div className="mt-2 text-[12px] text-red-700 text-center">
                    최소 {MIN_SELECTED}개는 유지해야 함
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
