import { useState } from "react";
import CheckL from "./CheckL.jsx";
import choiceIcon from "../../icons/choice_icon.png";
import SearchIcon from "../../icons/Search_icon.png";

export default function CheckLog() {

    const data = [
    { id: 1, title: "전기 점검", content: "배전반 점검 필요", date: "2025-06-05", status: "완료" },
    { id: 2, title: "냉난방 점검", content: "에어컨 필터 교체", date: "2019-04-02", status: "완료" },
    { id: 3, title: "수도/배관 점검", content: "배관 누수 확인", date: "2022-05-12", status: "미완료" },
    { id: 4, title: "가스 점검", content: "누출 테스트 필요", date: "2025-11-16", status: "완료" },
    { id: 5, title: "건물 내부 기본 점검", content: "계단 조명 교체", date: "2024-12-08", status: "미완료" }
  ];

  const [editMode, setEditMode] = useState(false);
  const [checkedRows, setCheckedRows] = useState(Array(data.length).fill(false));

  const toggleRow = (idx) => {
    const updated = [...checkedRows];
    updated[idx] = !updated[idx];
    setCheckedRows(updated);
  };

  // 항목 클릭 시 → 상세 페이지 / 수정 페이지 이동
  const handleItemClick = (row) => {
    console.log("클릭된 항목:", row);
    // 나중에 navigate("/check/view/" + row.id) 이런식으로 연결 가능
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto">

      {/* 상단 버튼 */}
      <div className="flex justify-end gap-3 my-4">
        {!editMode && (
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setEditMode(true)}
          >
            수정
          </button>
        )}

        {editMode && (
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setEditMode(false)}
          >
            완료
          </button>
        )}
      </div>

      {/* 리스트 */}
      {data.map((row, index) => (
        <CheckL
          key={row.id}
          row={row}
          index={index}
          checked={checkedRows[index]}
          toggleRow={() => toggleRow(index)}
          editMode={editMode}
          onClickItem={handleItemClick}
        />
      ))}
    </div>
  );
}