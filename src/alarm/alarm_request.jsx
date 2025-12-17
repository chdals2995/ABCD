// AlarmRequest.jsx
import { useState } from "react";
import CheckForm from "../Log/check_form";

export default function AlarmRequest({ items = [] }) {
  const [statusFilter, setStatusFilter] = useState("전체");

  // 선택 + 보기 모달
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const filtered = items.filter((item) => {
    if (statusFilter === "전체") return true;
    return item.status === statusFilter;
  });

  const handleMoreClick = () => {
    // TODO: navigate("/log") 같은거 연결 예정
  };

  return (
    <>
      {/* ✅ 스크롤바 숨김(스크롤은 됨) */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full h-full pt-[20px] px-[15px] bg-white flex flex-col min-h-0">
        {/* 헤더(고정) */}
        <div className="flex items-center justify-between mb-[30px] text-[17px] shrink-0">
          <button
            type="button"
            onClick={handleMoreClick}
            className="text-[15px] text-gray-400 hover:underline"
          >
            더보기...
          </button>

          <div className="flex gap-[8px]">
            {["전체", "접수", "처리중", "완료"].map((status) => {
              const isActive = statusFilter === status;

              const colorClass = (() => {
                if (!isActive) return "text-gray-500";
                if (status === "접수") return "text-[#25C310] font-bold";
                if (status === "처리중") return "text-[#FF3B3B] font-bold";
                if (status === "완료") return "text-[#367CFF] font-bold";
                return "text-[#054e76] font-bold";
              })();

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2 hover:underline ${colorClass}`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ 리스트만 스크롤 */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedRow(item);
                setOpenDetail(true); // ✅ 보기만
              }}
              className="flex justify-between items-center py-2 pb-4 border-b border-gray-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {item.status === "접수" && <span className="blink-dot"></span>}
                <span className="text-[16px] font-medium leading-6">
                  {item.title || item.content}
                </span>
              </div>

              <span
                className={`text-[17px] font-semibold
                  ${item.status === "접수" ? "text-[#25C310]" : ""}
                  ${item.status === "처리중" ? "text-[#FF3B3B]" : ""}
                  ${item.status === "완료" ? "text-[#367CFF]" : ""}
                `}
              >
                {item.status}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-gray-400 text-[14px] py-2">항목 없음</div>
          )}
        </div>
      </div>

      {openDetail && selectedRow && (
        <CheckForm
          mode="view"              // ⭐ 핵심
          row={{
            id: selectedRow.id,
            title: selectedRow.title,
            content: selectedRow.content,
            date: "",
            status: selectedRow.status,
            checkType: "상시",
          }}
          onClose={() => setOpenDetail(false)}
        />
      )}
    </>
  );
}
