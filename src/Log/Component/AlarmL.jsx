// AlarmL.jsx
import { useState } from "react";

export default function AlarmL({ row, index, editMode, selected, setSelected }) {
  const colors = {
    접수: "text-[#25C310]",
    처리중: "text-[#FF3B3B]",
    완료: "text-[#367CFF]",
  };

  const toggle = () => {
    if (selected.includes(row.id)) {
      setSelected(selected.filter((id) => id !== row.id));
    } else {
      setSelected([...selected, row.id]);
    }
  };

  // row.content 안에 "글자크기:XXpx" 같은 패턴 제거
  const cleanedContent = row.content?.replace(/글자\s*크기\s*:\s*\d+px/gi, "");

  return (
    <div className="grid grid-cols-6 items-center h-[58px] border-b text-[20px]">

      {/* No. */}
      <div className="w-[60px] text-center">{index}</div>

      {/* 체크박스 (수정모드일 때만 표시) */}
      <div className="w-[80px] flex justify-center">
        {editMode && <input type="checkbox" onChange={toggle} className="scale-150" />}
      </div>

      {/* 아이디 */}
      <div className="w-[200px] text-center">{row.user}</div>

      {/* 내용 (글자크기 문구 자동 제거됨) */}
      <div className="flex-1">{cleanedContent}</div>

      {/* 등록일 */}
      <div className="w-[200px] text-center">{row.date}</div>

      {/* 상태 텍스트 */}
      <div className="w-[150px] flex justify-center items-center">
        <span className={colors[row.status]}>{row.status}</span>
      </div>
    </div>
  );
}
