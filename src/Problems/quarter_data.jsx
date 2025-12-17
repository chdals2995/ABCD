//분기 데이터 

export default function QuarterData({
  quarterData,
  selectedQuarter,
  onSelectQuarter,
}) {
  // 분기 목록 추출
  const quarters = Object.keys(quarterData.byMetric);

  // 선택된 분기 데이터
  const current = quarterData.byMetric[selectedQuarter] || {
    전력: 0,
    온도: 0,
    수도: 0,
    가스: 0,
  };

  // 색상 팔레트 (TypeData와 통일)
  const colors = {
    전력: "#4A90E2",
    온도: "#FF6B6B",
    수도: "#4CD2C7",
    가스: "#FFA726",
  };

  return (
    <div className="w-full flex flex-col items-center mt-10">

      {/* ------------------ 분기 선택 UI ------------------ */}
      <div className="flex gap-6 text-[24px] font-bold mb-4">
        {quarters.map((q) => (
          <span
            key={q}
            className="cursor-pointer select-none"
            onClick={() => onSelectQuarter(q)}
            style={{
              color: selectedQuarter === q ? "#054E76" : "#999999",
            }}
          >
            {q}
          </span>
        ))}
      </div>

      {/* ------------------ 선택된 분기 데이터 ------------------ */}
      <div className="grid grid-cols-4 gap-6 mt-4">
        {Object.entries(current).map(([metric, count]) => (
          <div
            key={metric}
            className="flex flex-col items-center"
          >
            <div
              className="w-12 h-12 rounded-full mb-2 flex items-center justify-center text-white text-[18px] font-bold"
              style={{ backgroundColor: colors[metric] }}
            >
              {count}
            </div>

            <span className="text-[16px] text-gray-700">{metric}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-[13px] mt-4">
        선택된 분기의 문제 유형 현황입니다.
      </p>
    </div>
  );
}