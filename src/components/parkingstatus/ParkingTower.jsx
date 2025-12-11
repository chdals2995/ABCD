// src/components/parkingstatus/ParkingTower.jsx

const ROW_HEIGHT_CLASS = "h-[40px]"; // 한 칸 높이

export default function ParkingTower({ slots }) {
  if (!slots || slots.length === 0) {
    // 빈 상태는 기존 느낌 살리고 싶으면 여기만 고정 높이 사용
    return (
      <div className="w-[567px] h-[895px] border-2 border-[#0888D4] flex items-center justify-center text-sm text-gray-500 bg-white">
        주차 데이터가 없습니다.
      </div>
    );
  }

  // 높은 층이 위로 오도록 정렬
  const sorted = [...slots].sort((a, b) => {
    if (a.floorIndex !== b.floorIndex) {
      return b.floorIndex - a.floorIndex; // 큰 층수 위로
    }
    return (a.id || "").localeCompare(b.id || "");
  });

  const leftSlots = sorted.filter((s) => s.side === "L");
  const rightSlots = sorted.filter((s) => s.side === "R");
  const maxRows = Math.max(leftSlots.length, rightSlots.length);

  const getSlot = (arr, idx) => arr[idx] ?? null;

  const renderCell = (slot, key) => {
    if (!slot) {
      return <div key={key} className={ROW_HEIGHT_CLASS} />;
    }

    const colorClass = slot.occupied ? "bg-[#F1593A]" : "bg-[#0FA958]";
    // 🔹 차량번호 뒤 4자리만 표시
    const label = slot.occupied ? slot.carCode?.slice(-4) : "";

    return (
      <div
        key={key}
        className={`flex items-center justify-start px-2 ${ROW_HEIGHT_CLASS}`}
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

  // 🔹 높이 고정 없이, 줄 수만큼만 박스가 늘어나게
  return (
    <div className="w-[567px] border-2 border-[#0888D4] bg-white flex">
      {/* 왼쪽 컬럼 */}
      <div className="flex-1 border-r border-[#0888D4] flex flex-col">
        {Array.from({ length: maxRows }).map((_, idx) => (
          <div
            key={`L-${idx}`}
            className="border-b border-[#0888D4] last:border-b-0"
          >
            {renderCell(getSlot(leftSlots, idx), `L-${idx}`)}
          </div>
        ))}
      </div>

      {/* 가운데 빈 공간 (리프트 영역) */}
      <div className="w-[80px] border-r border-[#0888D4]" />

      {/* 오른쪽 컬럼 */}
      <div className="flex-1 flex flex-col">
        {Array.from({ length: maxRows }).map((_, idx) => (
          <div
            key={`R-${idx}`}
            className="border-b border-[#0888D4] last:border-b-0"
          >
            {renderCell(getSlot(rightSlots, idx), `R-${idx}`)}
          </div>
        ))}
      </div>
    </div>
  );
}
