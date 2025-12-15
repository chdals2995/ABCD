// AlarmL.jsx
import choiceIcon from "../assets/icons/choice_icon.png";

export default function AlarmL({
  row,
  index,
  checked,
  toggleRow,
  editMode,
  onClickContent,   // ← 추가
  onToggleStatus,   // ← 추가22
}) {
  return (
    <div
      className="
        grid
        grid-cols-[60px_60px_180px_1.2fr_180px_120px]
        text-[20px]
        py-3
        border-b
        items-center
        w-full
      "
    >
      {/* No */}
      <div className="text-center">{index + 1}</div>

      {/* 체크박스 */}
      <div className="flex justify-center">
        {editMode && (
          <div className="cursor-pointer" onClick={toggleRow}>
            <div className="w-[25px] h-[25px] bg-[#C8C8C8] rounded-[3px] flex items-center justify-center">
              {checked && <img src={choiceIcon} className="w-[14px] h-[14px]" />}
            </div>
          </div>
        )}
      </div>

      {/* 아이디 */}
      <div className="flex items-center justify-center text-center break-all leading-tight">
        {row.user || row.id}
      </div>

      {/* 내용(클릭 시 RequestArrival 열림) */}
      <div
        className="
          w-[440px]
          pl-15 
          overflow-hidden 
          text-center
          truncate
          cursor-pointer
          hover:underline
        "
        onClick={onClickContent}
      >
        {row.content}
      </div>

      {/* 날짜 */}
      <div className="text-center">{row.date}</div>

      {/* 상태 */}
      <div className="text-center">
        <span
          className={`cursor-pointer select-none ${
              row.status === "접수"
                ? "text-[#25C310]"
                : row.status === "처리중"
                ? "text-[#FF3B3B]"
                : "text-[#367CFF]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (editMode) return;
              onToggleStatus && onToggleStatus(row);
            }}
          >
          {row.status}
        </span>
      </div>
    </div>
  );
}
