// /src/problems/type_data.jsx
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

export default function TypeData({ data, selectedMetric, items = [] }) {
  /* =========================
     전체(all) 타입 색상
  ========================= */
  const typeColors = {
    전력: "#c2edff",
    온도: "#6ee6fb",
    수도: "#61a5ff",
    가스: "#52b7ff",
  };

  /* =========================
     원인 색상 (톤 통일)
  ========================= */
  const CAUSE_COLORS = {
    전력: {
      "운영/사용 패턴": "#e9f8ff",
      "설정/제어 문제": "#d6f2ff",
      "설비 고장/성능 저하": "#c2edff",
      "안전/누수·누출": "#a8e3ff",
      "계측/데이터 이상": "#8fd9ff",
      "기타": "#e5e7eb",
    },

    온도: {
      "설정/제어 문제": "#e6fbff",
      "설비 고장/성능 저하": "#c9f4fd",
      "외부환경/건물 요인": "#6ee6fb",
      "운영/사용 패턴": "#58d9f0",
      "계측/데이터 이상": "#40cbe6",
      "기타": "#e5e7eb",
    },

    수도: {
      "안전/누수·누출": "#e3efff",
      "운영/사용 패턴": "#cddfff",
      "설정/제어 문제": "#61a5ff",
      "계획된 작업/행사": "#4f97f5",
      "계측/데이터 이상": "#3b88e6",
      "기타": "#e5e7eb",
    },

    가스: {
      "안전/누수·누출": "#e0efff",
      "운영/사용 패턴": "#c6e0ff",
      "설비 고장/성능 저하": "#52b7ff",
      "설정/제어 문제": "#3fa8f0",
      "기타": "#e5e7eb",
    },
  };

  /* =========================
     원인 분류 설정
  ========================= */
  const CAUSE_CONFIG = {
    전력: {
      order: [
        "운영/사용 패턴",
        "설정/제어 문제",
        "설비 고장/성능 저하",
        "안전/누수·누출",
        "계측/데이터 이상",
        "기타",
      ],
      colors: CAUSE_COLORS.전력,
      rules: [
        { key: "안전/누수·누출", patterns: ["누전", "절연", "접지", "누설전류", "감전", "rcd", "elb"] },
        { key: "계측/데이터 이상", patterns: ["ct", "미터", "계량", "계측", "센서", "데이터", "통신", "누락", "오류", "이상"] },
        { key: "설정/제어 문제", patterns: ["hvac", "공조", "에어컨", "설정", "제어", "스케줄", "on/off"] },
        { key: "설비 고장/성능 저하", patterns: ["모터", "펌프", "팬", "고장", "불량", "노후"] },
        { key: "운영/사용 패턴", patterns: ["피크", "과부하", "부하", "상시", "야간", "사용량"] },
      ],
    },

    온도: {
      order: [
        "설정/제어 문제",
        "설비 고장/성능 저하",
        "외부환경/건물 요인",
        "운영/사용 패턴",
        "계측/데이터 이상",
        "기타",
      ],
      colors: CAUSE_COLORS.온도,
      rules: [
        { key: "계측/데이터 이상", patterns: ["센서", "교정", "통신", "데이터", "오류"] },
        { key: "설비 고장/성능 저하", patterns: ["냉난방", "hvac", "에러", "압축기", "히트펌프"] },
        { key: "설정/제어 문제", patterns: ["설정온도", "setpoint", "제어", "모드"] },
        { key: "외부환경/건물 요인", patterns: ["창문", "외기", "일사", "바람"] },
        { key: "운영/사용 패턴", patterns: ["인원", "행사", "사용"] },
      ],
    },

    수도: {
      order: [
        "안전/누수·누출",
        "운영/사용 패턴",
        "설정/제어 문제",
        "계획된 작업/행사",
        "계측/데이터 이상",
        "기타",
      ],
      colors: CAUSE_COLORS.수도,
      rules: [
        { key: "안전/누수·누출", patterns: ["누수", "배관", "파손", "침수"] },
        { key: "계측/데이터 이상", patterns: ["유량계", "미터", "통신", "오류"] },
        { key: "설정/제어 문제", patterns: ["펌프", "압력", "수위", "제어"] },
        { key: "계획된 작업/행사", patterns: ["청소", "세척", "점검", "공사"] },
        { key: "운영/사용 패턴", patterns: ["샤워", "급탕", "피크", "사용"] },
      ],
    },

    가스: {
      order: [
        "안전/누수·누출",
        "운영/사용 패턴",
        "설비 고장/성능 저하",
        "설정/제어 문제",
        "기타",
      ],
      colors: CAUSE_COLORS.가스,
      rules: [
        { key: "안전/누수·누출", patterns: ["누출", "누설", "경보기", "가스 냄새"] },
        { key: "설비 고장/성능 저하", patterns: ["연소", "버너", "점화", "고장"] },
        { key: "설정/제어 문제", patterns: ["밸브", "설정", "제어", "방치"] },
        { key: "운영/사용 패턴", patterns: ["난방", "보일러", "가동", "피크"] },
      ],
    },
  };

  const isAll = selectedMetric === "all";
  const config = CAUSE_CONFIG[selectedMetric];

  /* =========================
     원인별 집계
  ========================= */
  const causeData = useMemo(() => {
    if (!config) return {};

    const counts = {};
    config.order.forEach((k) => (counts[k] = 0));

    for (const p of items) {
      const raw = p?.cause ?? p?.reason ?? p?.title ?? p?.content ?? "";
      const text = `${p?.type ?? ""} ${p?.metric ?? ""} ${raw}`.toLowerCase();

      let picked = "기타";
      for (const rule of config.rules) {
        if (rule.patterns.some((kw) => text.includes(kw))) {
          picked = rule.key;
          break;
        }
      }
      counts[picked] += 1;
    }

    const cleaned = {};
    config.order.forEach((k) => {
      if (counts[k] > 0) cleaned[k] = counts[k];
    });

    return cleaned;
  }, [items, config]);

  const source = isAll ? data : causeData;
  const labels = Object.keys(source || {});
  const values = Object.values(source || {});

  if (labels.length === 0) {
    return (
      <div className="w-full flex mt-12 select-none">
        <div className="w-[480px] h-[480px] mt-[-20px] ml-[-30px] flex items-center justify-center text-gray-400">
          데이터 없음
        </div>
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((label) => {
          if (isAll) return typeColors[label] || "#ddd";
          return config?.colors?.[label] || "#ddd";
        }),
        borderColor: "#fff",
        borderWidth: 2,

        // 🔥 작은 파이도 크게 보이게
        minAngle: 50,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          font: { size: 18, weight: "bold" },
          padding: 20,
        },
      },

      tooltip: {
        padding: 16,
        titleFont: { size: 16, weight: "bold" },
        bodyFont: { size: 14 },
        boxWidth: 14,
        boxHeight: 14,
        bodySpacing: 6,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${v}건 (${pct}%)`;
          },
        },
      },

      datalabels: {
        color: "#054E76",
        font: { size: 16, weight: "bold" },
        anchor: "center",
        align: "center",
        formatter: (value, ctx) => {
          const arr = ctx.chart.data.datasets[0].data;
          const total = arr.reduce((a, b) => a + b, 0);
          const pct = total ? (value / total) * 100 : 0;
          if (pct < 5) return "";
          return [`${value}건`, `${pct.toFixed(0)}%`];
        },
      },
    },
  };

  return (
    <div className="w-full flex mt-12 select-none">
      <div className="w-[480px] h-[480px] mt-[-20px] ml-[-30px]">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
