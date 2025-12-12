import { ref, update } from "firebase/database";
import { rtdb } from "../../firebase/config";

export default function CheckL({ row, index, onClickItem }) {
  const toggleStatus = async (e) => {
    e.stopPropagation(); // 행 클릭(상세/수정) 막기

    const nextStatus = row.status === "완료" ? "미완료" : "완료";

    await update(ref(rtdb, `Check/${row.id}`), {
      status: nextStatus,
    });
  };

  return (
    <div
      className="
        grid 
        grid-cols-[60px_300px_1fr_200px_150px]
        border-b items-center text-[22px]
        py-3
        cursor-pointer
        select-none
      "
      onClick={() => onClickItem && onClickItem(row)}
    >
      {/* No */}
      <div className="text-center">{index + 1}</div>

      {/* 점검항목 + 점검구분 */}
      <div className="flex flex-col items-center">
        <span>{row.title}</span>
        <span
          className={`
            mt-1 text-[16px]
            ${row.checkType === "정기" ? "text-blue-600" : "text-[#054E76]"}
          `}
        >
          {row.checkType} 점검
        </span>
      </div>

      {/* 내용 */}
      <div className="text-center">{row.content}</div>

      {/* 점검일 */}
      <div className="text-center">{row.date}</div>

      {/* 상태 — 항상 토글 */}
      <div
        className="text-center font-medium"
        onClick={toggleStatus}
        style={{
          color: row.status === "완료" ? "#0E5FF0" : "#CA3535",
        }}
      >
        {row.status}
      </div>
    </div>
  );
}
