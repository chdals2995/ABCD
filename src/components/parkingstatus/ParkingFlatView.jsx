// src/components/parkingstatus/ParkingFlatView.jsx

// slots: [{ id, floorIndex, occupied, carCode, ... }]
export default function ParkingFlatView({ slots }) {
  if (!slots || slots.length === 0) {
    return (
      <div className="w-[567px] min-h-[895px] flex items-center justify-center text-sm text-gray-500 bg-white border-2 border-[#0888D4]">
        주차 데이터가 없습니다.
      </div>
    );
  }

  // floorIndex 기준으로 그룹핑
  const floors = Array.from(
    slots.reduce((map, slot) => {
      const key = slot.floorIndex ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(slot);
      return map;
    }, new Map())
  )
    .sort((a, b) => b[0] - a[0]) // 높은 층 위로
    .map(([floorIndex, items]) => ({
      floorIndex,
      items: items.sort((a, b) => (a.id || "").localeCompare(b.id || "")),
    }));

  const COL_COUNT = 2; // 항상 2칸

  const renderCell = (slot, idx) => {
    const row = Math.floor(idx / COL_COUNT);
    const col = idx % COL_COUNT;

    const isFirstRow = row === 0;
    const isFirstCol = col === 0;

    // 더미 칸
    if (!slot) {
      return (
        <div
          key={`empty-${idx}`}
          className={`
            h-[50px] flex items-center justify-start px-2
            border-[#0888D4]
            ${isFirstRow ? "" : "border-t"}
            ${isFirstCol ? "" : "border-l"}
          `}
        />
      );
    }

    const colorClass = slot.occupied ? "bg-[#F1593A]" : "bg-[#0FA958]";
    const label = slot.occupied ? slot.carCode?.slice(-4) : "";

    return (
      <div
        key={slot.id}
        className={`
          h-[50px] flex items-center justify-start px-2 border-[#0888D4]
          ${isFirstRow ? "" : "border-t"}
          ${isFirstCol ? "" : "border-l"}
        `}
      >
        <div className={`w-4 h-4 rounded-full ${colorClass}`} />
        {label && (
          <span className="ml-2 text-xl font-semibold text-[#054E76]">
            {label}
          </span>
        )}
      </div>
    );
  };

  // 🔹 전체 wrapper 높이: min-h, 내용 많으면 바깥으로 계속 늘어남
  return (
    <div className="w-[567px] min-h-[895px] flex flex-col bg-transparent">
      <div className="flex flex-col gap-6">
        {floors.map(({ floorIndex, items }) => {
          const rows = Math.ceil(items.length / COL_COUNT);
          const cellCount = rows * COL_COUNT; // 예: 슬롯 5개 → 3줄 6칸

          return (
            <div key={floorIndex} className="flex items-start gap-4">
              {/* 왼쪽: 층 표시 */}
              <div className="w-[60px] text-right text-xl font-bold text-[#054E76] pt-2">
                {floorIndex}층
              </div>

              {/* 오른쪽: 해당 층 주차 박스 */}
              <div className="flex-1 border-2 border-[#0888D4] bg-white">
                <div className="grid grid-cols-2">
                  {Array.from({ length: cellCount }).map((_, idx) =>
                    renderCell(items[idx], idx)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
