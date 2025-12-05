// AlarmL.jsx
import choiceIcon from "../../icons/choice_icon.png";

export default function AlarmL({ row, checked, toggleRow }) {
  return (
    <div
      className="
        grid
        grid-cols-[60px_80px_200px_1fr_200px_150px]
        text-[22px]
        py-3
        border-b
        items-center
        w-full
      "
    >

      {/* No */}
      <div className="text-center">{row.id}</div>

      {/* 체크박스 - 박스는 항상 같고, 안에 체크 아이콘만 들어감 */}
      <div
        className="flex justify-center cursor-pointer"
        onClick={toggleRow}
      >
        <div className="
          w-[25px] h-[25px] 
          rounded-[3px]
          bg-[#C8C8C8]
          flex items-center justify-center
        ">
          {checked && (
            <img src={choiceIcon} className="w-[14px] h-[14px]" />
          )}
        </div>
      </div>

      {/* 아이디 */}
      <div className="text-center truncate">{row.user}</div>

      {/* 내용 */}
      <div className="pl-2 whitespace-nowrap overflow-hidden">
        {row.content || ""}
      </div>

      {/* 등록일 */}
      <div className="text-center">{row.date}</div>

      {/* 상태 */}
      <div className="text-center">
        <span
          className={
            row.status === "접수"
              ? "text-[#25C310]"
              : row.status === "처리중"
              ? "text-[#FF3B3B]"
              : "text-[#367CFF]"
          }
        >
          {row.status}
        </span>
      </div>
    </div>
  );
}
