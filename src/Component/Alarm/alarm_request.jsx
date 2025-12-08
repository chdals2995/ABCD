import { useState } from "react";

// metric 한글 변환
const metricMap = {
  water: "수도",
  power: "전력",
  gas: "가스",
  temp: "온도",
};

// level 한글 변환
const levelMap = {
  warning: "경고",
  danger: "문제",
  caution: "주의",
  normal: "정상",
};

// reason 변환
const reasonMap = {
  strong_overload_from_caution: "과부하 가능성이 감지되었습니다.",
};

export default function AlarmRequest({ items = [] }) {
  const [sortOrder, setSortOrder] = useState("latest");

  // 변환된 리스트
  const displayList = items.map((a) => ({
    id: a.id,
    floor: a.floor,
    level: levelMap[a.level] ?? a.level,
    metric: metricMap[a.metric] ?? a.metric,
    reason: reasonMap[a.reason] ?? a.reason,
    date: new Date(a.createdAt).toLocaleString(),
  }));

  const sortedList = [...displayList].sort((a, b) =>
    sortOrder === "latest" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
  );

  return (
    <div className="w-[335px] h-[698px] pt-[79px] px-[15px] bg-white">

      {/* 정렬 메뉴 */}
      <div className="flex justify-end mt-[-50px] mb-[40px] gap-[10px] text-[14px]">

        <button
          onClick={() => setSortOrder("latest")}
          className={`${sortOrder === "latest" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          최신순
        </button>

        <span className="text-gray-400">|</span>

        <button
          onClick={() => setSortOrder("old")}
          className={`${sortOrder === "old" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          오래된순
        </button>
      </div>

      {/* 실제 알림 리스트 */}
      {sortedList.length === 0 && (
        <div className="text-center text-gray-400 mt-20">알림이 없습니다.</div>
      )}

      {sortedList.map((item, idx) => (
        <div key={idx} className="flex justify-between pb-[20px]">

          {/* ● + 제목 */}
          <div className="flex flex-col gap-1">
            {/* 색을 주고 싶으면 level 기준으로 점 색 지정 */}
            <div className="flex items-center gap-2">
              {item.level === "경고" && (
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
              )}
              {item.level === "주의" && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
              )}
              {item.level === "문제" && (
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              )}

              <span className="text-[16px] font-medium">
                [{item.level}] {item.metric} 감지
              </span>
            </div>

            {/* reason */}
            <span className="text-[14px] text-gray-600 ml-[14px]">
              {item.reason}
            </span>

            {/* floor + date */}
            <span className="text-[12px] text-gray-400 ml-[14px]">
              {item.floor} · {item.date}
            </span>
          </div>

        </div>
      ))}

    </div>
  );
}
