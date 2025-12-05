import choiceIcon from "../../icons/choice_icon.png";

export default function CheckL({
  row,
  index,
  checked,
  toggleRow,
  editMode,
  onClickItem,
}) {
  return (
    <div
      className="
        grid
        grid-cols-[60px_80px_250px_1fr_200px_150px]
        text-[22px]
        py-3
        border-b
        items-center
        w-full
      "
    >

      {/* No */}
      <div className="text-center">{row.id}</div>

      {/* 체크박스 (editMode일 때만 보임) */}
      <div
        className={`
          flex justify-center cursor-pointer transition-opacity
          ${editMode ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={editMode ? toggleRow : undefined}
      >
        <div
          className="
            w-[24px] h-[24px]
            rounded-[3px]
            bg-[#D9D9D9]
            flex items-center justify-center
          "
        >
          {checked && (
            <img src={choiceIcon} className="w-[14px] h-[14px]" />
          )}
        </div>
      </div>

      {/* 점검항목 - 클릭하면 수정페이지로 이동하는 구조 */}
      <div
        className="cursor-pointer pl-2 whitespace-nowrap overflow-hidden truncate"
        onClick={() => onClickItem && onClickItem(row)}
      >
        {row.title}
      </div>

      {/* 내용 */}
      <div className="pl-2 whitespace-nowrap overflow-hidden">
        {row.content || ""}
      </div>

      {/* 점검일 */}
      <div className="text-center">{row.date}</div>

      {/* 상태 */}
      <div className="text-center">
        <span
          className={
            row.status === "완료"
              ? "text-[#0E5F90]" // 파랑
              : row.status === "미완료"
              ? "text-[#CA3535]" // 빨강
              : "text-[#000]"    // 기본
          }
        >
          {row.status}
        </span>
      </div>
    </div>
  );
}
