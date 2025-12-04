// AlarmLog.jsx
import AlarmL from "./AlarmL";

export default function AlarmLog() {
  // 더미 데이터 (추후 DB 연동)
  const data = [
    { id: 1, user: "qeaowymu", content: "글자크기:20px", date: "2024-10-13", status: "접수" },
    { id: 2, user: "evuopugh", content: "", date: "2021-04-05", status: "처리중" },
    { id: 3, user: "wbbtoafk", content: "", date: "2022-07-22", status: "처리중" },
    { id: 4, user: "k4xxdnh6", content: "", date: "2025-08-31", status: "접수" },
    { id: 5, user: "wev5peal", content: "", date: "2019-12-11", status: "완료" },
  ];

  return (
    <div className="w-[1429px] border-t border-[#D0D0D0]">

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-6 text-[26px] font-semibold py-3 border-b">
        <div className="w-[60px] text-center">No.</div>
        <div className="w-[80px] text-center">✔</div>
        <div className="w-[200px] text-center">아이디</div>
        <div className="flex-1 text-left">내용</div>
        <div className="w-[200px] text-center">등록일</div>
        <div className="w-[150px] text-center">상태</div>
      </div>

      {/* 리스트 */}
      {data.map((row, idx) => (
        <AlarmL key={row.id} row={row} index={idx + 1} />
      ))}

    </div>
  );
}
