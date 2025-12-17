// /src/problems/type_data.jsx
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

export default function TypeData({ data, selectedMetric, items = [] }) {
  // ✅ 전체(all)일 때 타입별 색상
  const typeColors = {
    전력: "#c2edff",
    온도: "#6ee6fb",
    수도: "#61a5ff",
    가스: "#52b7ff",
  };

  // ✅ 타입(전력/온도/수도/가스)마다 팔레트를 “확 다르게”
  const CAUSE_COLORS = {
    전력: {
      "운영/사용 패턴": "#FFF3B0",
      "설정/제어 문제": "#FFD166",
      "설비 고장/성능 저하": "#F4A261",
      "안전/누수·누출": "#E76F51",
      "계측/데이터 이상": "#BDB2FF",
      "기타": "#E5E7EB",
    },
    온도: {
      "설정/제어 문제": "#FFCAD4",
      "설비 고장/성능 저하": "#F08080",
      "외부환경/건물 요인": "#FFB703",
      "운영/사용 패턴": "#FB8500",
      "계측/데이터 이상": "#90DBF4",
      "기타": "#E5E7EB",
    },
    수도: {
      "안전/누수·누출": "#00B4D8",
      "운영/사용 패턴": "#90E0EF",
      "설정/제어 문제": "#0077B6",
      "계획된 작업/행사": "#48CAE4",
      "계측/데이터 이상": "#BDE0FE",
      "기타": "#E5E7EB",
    },
    가스: {
      "안전/누수·누출": "#FF595E",
      "운영/사용 패턴": "#8AC926",
      "설비 고장/성능 저하": "#1982C4",
      "설정/제어 문제": "#6A4C93",
      "기타": "#E5E7EB",
    },
  };

  // ✅ 원인 분류 설정(타입별)
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
      // 우선순위: 안전 > 데이터 > 설정 > 설비 > 운영
      rules: [
        { key: "안전/누수·누출", patterns: ["누전", "절연", "접지", "누설전류", "감전", "rcd", "elb"] },
        { key: "계측/데이터 이상", patterns: ["ct", "미터", "계량", "계측", "센서", "데이터", "통신", "누락", "오류", "이상", "튐", "스파이크", "고정값", "결측"] },
        { key: "설정/제어 문제", patterns: ["hvac", "공조", "에어컨", "스케줄", "운전모드", "모드", "설정", "제어", "타이머", "on/off"] },
        { key: "설비 고장/성능 저하", patterns: ["모터", "펌프", "팬", "과전류", "이상전류", "발열", "노후", "효율", "고장", "불량"] },
        { key: "운영/사용 패턴", patterns: ["피크", "과부하", "부하", "대기전력", "상시", "점등", "조명", "야간", "24시간", "사용량"] },
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
      // 우선순위: 데이터 > 설비 > 설정 > 외부 > 운영
      rules: [
        { key: "계측/데이터 이상", patterns: ["온도센서", "센서", "sensor", "교정", "캘리브", "calib", "offset", "위치", "통신", "데이터", "스파이크", "결측", "튐", "고정값", "오류"] },
        { key: "설비 고장/성능 저하", patterns: ["냉난방", "hvac", "고장", "에러", "풍량", "필터", "막힘", "밸브", "댐퍼", "고착", "팬", "코일", "압축기", "히트펌프"] },
        { key: "설정/제어 문제", patterns: ["설정온도", "setpoint", "과냉", "과열", "구역", "존", "zone", "불균형", "밸런스", "제어", "스케줄", "모드", "설정"] },
        { key: "외부환경/건물 요인", patterns: ["창문", "문", "개방", "단열", "열손실", "외기", "외부", "일사", "햇빛", "바람"] },
        { key: "운영/사용 패턴", patterns: ["인원", "밀집", "내부발열", "발열", "회의", "행사", "사용"] },
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
      // 우선순위: 누수 > 데이터 > 제어 > 작업 > 운영
      rules: [
        { key: "안전/누수·누출", patterns: ["누수", "새는", "배관", "파손", "누출", "침수", "야간", "유량 유지"] },
        { key: "계측/데이터 이상", patterns: ["유량계", "미터", "계량", "통신", "데이터", "결측", "스파이크", "튐", "고정값", "오류"] },
        { key: "설정/제어 문제", patterns: ["펌프", "탱크", "제어", "압력", "압력 흔들", "수위", "레벨", "인버터", "vfd"] },
        { key: "계획된 작업/행사", patterns: ["청소", "세척", "작업", "점검", "소독", "공사", "행사"] },
        { key: "운영/사용 패턴", patterns: ["샤워", "급탕", "피크", "변기", "수전", "방치", "사용", "집중", "시간대"] },
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
      // 우선순위: 안전 > 설비 > 설정 > 운영
      rules: [
        { key: "안전/누수·누출", patterns: ["누출", "누설", "감지기", "경보", "환기", "가스 냄새", "가스밸브", "경보기"] },
        { key: "설비 고장/성능 저하", patterns: ["연소", "버너", "노즐", "효율", "점화", "레귤레이터", "압력 이상", "고장", "불량"] },
        { key: "설정/제어 문제", patterns: ["밸브", "개방", "방치", "운영 실수", "실수", "설정", "제어"] },
        { key: "운영/사용 패턴", patterns: ["난방", "보일러", "장시간", "과사용", "가동", "피크"] },
      ],
    },
  };

  const isAll = selectedMetric === "all";
  const config = CAUSE_CONFIG[selectedMetric];

  // ✅ 원인 그룹별 카운트 만들기 (ProblemsLog items 기준)
  const causeData = useMemo(() => {
    if (!config) return {};

    const counts = {};
    config.order.forEach((k) => (counts[k] = 0));

    for (const p of items) {
      const raw = p?.cause ?? p?.reason ?? p?.title ?? p?.content ?? "";
      const mergedText = `${p?.type ?? ""} ${p?.metric ?? ""} ${raw}`.trim().toLowerCase();

      let picked = "기타";
      for (const rule of config.rules) {
        if (rule.patterns.some((kw) => mergedText.includes(String(kw).toLowerCase()))) {
          picked = rule.key;
          break;
        }
      }

      counts[picked] = (counts[picked] || 0) + 1;
    }

    // 0인 항목 제거
    const cleaned = {};
    config.order.forEach((k) => {
      if ((counts[k] || 0) > 0) cleaned[k] = counts[k];
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
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          font: { size: 18, weight: "bold" },
          padding: 20,
        },
      },

      // ✅ hover tooltip
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((v / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${v}건 (${pct}%)`;
          },
        },
      },

      // ✅ 파이 조각 안에 "건수 + 비율" 표시
      datalabels: {
        color: "#054E76",
        textAlign: "center",
        font: { size: 16, weight: "bold" },
        anchor: "center",
        align: "center",
        formatter: (value, ctx) => {
          const arr = ctx.chart.data.datasets[0].data || [];
          const total = arr.reduce((a, b) => a + b, 0);
          const pct = total ? (value / total) * 100 : 0;

          // 너무 작은 조각은 표시 안함(겹침 방지)
          if (pct < 5) return "";

          // 두 줄 표시(추천)
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
