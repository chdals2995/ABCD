// UnsolvedList.jsx
export default function UnsolvedList({ items = [], onSelectProblem }) {
  return (
    <div
      className="
        w-[450px] h-[656px] mt-42 mr-6
        bg-white border rounded-xl
        p-6
      "
    >
      {/* 제목 */}
      <div className="text-[22px] font-bold mb-2 text-center">
        미해결 항목
      </div>

      {/* 리스트 */}
      <div className="flex flex-col gap-4">
        {items.length === 0 && (
          <div className="text-center text-gray-400 text-[14px] mt-20">
            미해결 항목이 없습니다.
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectProblem?.(item.id)}
            className="
              cursor-pointer
              border-b pb-4
              hover:bg-gray-50 transition
            "
          >
            {/* 타입 */}
            <div className="text-[18px] font-bold mb-1">
              {item.metric}
            </div>

            {/* 위치 + 시간 */}
            <div className="text-[14px] text-gray-600">
              {item.floor} ·{" "}
              {new Date(item.createdAt).toLocaleString("ko-KR")}
            </div>

            {/* 내용 */}
            <div className="text-[14px] text-gray-700 mt-1">
              {item.reason}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 자리 */}
      <div className="mt-6 text-center
                      text-gray-400 text-[14px] cursor-pointer">
        &lt;&lt; &nbsp; &lt; &nbsp; 1 &nbsp; &gt; &nbsp; &gt;&gt;
      </div>
    </div>
  );
}
