// src/components/parkingstatus/ParkingTower.jsx

const ROW_HEIGHT_CLASS = "h-[40px]"; // 한 칸 높이

export default function ParkingTower({ slots, slotsPerFloor = 2 }) {
  if (!slots || slots.length === 0) {
    // 빈 상태는 기존 느낌 유지
    return (
      <div className="w-[567px] h-[895px] border-2 border-[#0888D4] flex items-center justify-center text-sm text-gray-500 bg-white">
        주차 데이터가 없습니다.
      </div>
    );
  }

  // floorIndex 기준으로 층별 그룹핑
  const floors = Array.from(
    slots.reduce((map, slot) => {
      const key = slot.floorIndex ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(slot);
      return map;
    }, new Map())
  )
    // 높은 층이 위로 오도록 정렬
    .sort((a, b) => b[0] - a[0])
    .map(([floorIndex, items]) => ({
      floorIndex,
      items: items.sort((a, b) => (a.id || "").localeCompare(b.id || "")),
    }));

  // 너무 큰 값 들어와도 6칸까지만 허용 (UI 깨지는 것 방지)
  const colCount = Math.max(1, Math.min(slotsPerFloor, 6));

  return (
    <div className="w-[567px] border-2 border-[#0888D4] bg-white flex flex-col">
      {floors.map(({ floorIndex, items }) => (
        <div
          key={floorIndex}
          className="flex border-b border-[#0888D4] last:border-b-0"
        >
          {Array.from({ length: colCount }).map((_, colIndex) => {
            const slot = items[colIndex] ?? null;
            const isLastCol = colIndex === colCount - 1;

            const colorClass =
              slot && slot.occupied
                ? "bg-[#F1593A]"
                : slot
                ? "bg-[#0FA958]"
                : "";
            const label = slot && slot.occupied ? slot.carCode?.slice(-4) : "";

            return (
              <div
                key={`${floorIndex}-${colIndex}`}
                className={`
                  flex-1
                  ${isLastCol ? "" : "border-r border-[#0888D4]"}
                  flex items-center justify-start px-2
                  ${ROW_HEIGHT_CLASS}
                `}
              >
                {slot && (
                  <>
                    <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                    {label && (
                      <span className="ml-2 text-xl font-semibold text-[#054E76]">
                        {label}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
