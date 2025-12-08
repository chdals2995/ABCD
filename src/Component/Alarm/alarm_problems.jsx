import cautionIcon from "../../icons/Alert_triangle.png";
import warningIcon from "../../icons/Alert_triangle_red.png";

// metric → 한글 변환
const metricMap = {
  water: "수도",
  power: "전력",
  gas: "가스",
  temp: "온도",
};

// reason → 설명문 변환
const reasonMap = {
  strong_overload_from_caution: "과부하 가능성이 감지되었습니다.",
};

export default function AlarmProblems({ items = [] }) {
  // UI 섹션 구성
  const sections = [
    { level: "경고", icon: warningIcon },
    { level: "주의", icon: cautionIcon },
  ];

  // items는 Alarm.jsx에서 이미 변환된 alerts 목록이 들어올 것
  const problemList = items.map((a) => ({
    id: a.id,
    floor: a.floor,
    level: a.level, // "문제" | "경고" | "주의"
    metric: metricMap[a.metric] ?? a.metric,
    reason: reasonMap[a.reason] ?? a.reason,
    date: new Date(a.createdAt).toLocaleString(),
  }));

  return (
    <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px] text-black">

      {sections.map((sec, idx) => (
        <div key={idx} className="mb-6">

          {/* 섹션 제목 */}
          <div className="flex items-center gap-2 mb-2">
            <img src={sec.icon} className="w-[18px] h-[18px]" />
            <span className="text-[20px]">{sec.level}</span>
          </div>

          {/* 해당 level 알림만 출력 */}
          {problemList
            .filter((p) => p.level === sec.level)
            .map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-[#e5e5e5] py-2"
              >
                <div className="flex flex-col">
                  <span className="text-[16px] w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    [{item.metric}] {item.reason}
                  </span>

                  <span className="text-[12px] text-gray-400 mt-1">
                    {item.floor} · {item.date}
                  </span>
                </div>
              </div>
            ))
          }

          {/* 안내문구 */}
          <div className="w-full flex flex-col items-center py-3">
            <span className="text-[13px] text-gray-400 mb-1">
              아래로 스크롤하여 더 보기
            </span>
            <span className="text-[20px] text-gray-400 arrow-bounce">↓</span>
          </div>

        </div>
      ))}
    </div>
  );
}
