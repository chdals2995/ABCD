// AlarmLog.jsx
import { useState, useRef } from "react";
import choiceIcon from "../../icons/choice_icon.png";
import CalendarIcon from "../../icons/calendar_icon.png"; 
import AlarmL from "./AlarmL.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

export default function AlarmLog() {
  const data = [
    { id: 1, user: "qeaowymu", content: "", date: "2025-10-13", status: "접수" },
    { id: 2, user: "evuopugh", content: "", date: "2025-04-05", status: "처리중" },
    { id: 3, user: "wbbtoafk", content: "", date: "2025-07-22", status: "처리중" },
    { id: 4, user: "k4xxdnh6", content: "", date: "2025-08-31", status: "접수" },
    { id: 5, user: "wev5peal", content: "", date: "2025-12-11", status: "완료" },
    { id: 6, user: "uuj5659d", content: "", date: "2025-12-11", status: "완료" },
  ];

  /*  ================= 체크박스  =================*/
  const [checkedRows, setCheckedRows] = 
        useState(Array(data.length).fill(false));
  const [isAllChecked, setIsAllChecked] = useState(false);

  /* ================= 날짜 필터 ================= */
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedSelectedDate = selectedDate
    ? selectedDate.toISOString().slice(0, 10)
    : null;

  /* 상태 필터 */
  const [statusFilter, setStatusFilter] = useState(null);

  /* ================= 필터 통합 (날짜 + 상태) ================= */
  let filteredData = data;

  if (formattedSelectedDate) {
    filteredData = filteredData.filter(
      (row) => row.date === formattedSelectedDate
    );
  }

  if (statusFilter) {
    filteredData = filteredData.filter((row) => row.status === statusFilter);
  }

  /* ========================= 체크박스 제어 ========================= */
  const toggleAll = () => {
    const newValue = !isAllChecked;
    setIsAllChecked(newValue);
    setCheckedRows(Array(data.length).fill(newValue));
  };

  const toggleRow = (index) => {
    const updated = [...checkedRows];
    updated[index] = !updated[index];
    setCheckedRows(updated);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">

      {/* ========================= 필터 영역 ========================= */}
      <div className="flex justify-between items-center mb-4 text-[18px]">

        {/* ---------------- 왼쪽 필터: 전체 / 날짜 ---------------- */}
        <div className="flex items-center gap-4">

          {/* 전체 → 날짜 + 상태 모두 초기화 */}
          <button
            className="text-[#054E76] font-semibold cursor-pointer"
            onClick={() => {
              setSelectedDate(null);
              setStatusFilter(null);
            }}
          >
            전체
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]"></div>

          {/* 날짜 선택 */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => datePickerRef.current.setOpen(true)}
          >
            <span className="font-[500]">
              날짜{" "}
              {selectedDate
                ? selectedDate.toISOString().slice(0, 10).replace(/-/g, ".")
                : "2025.01.01"}
            </span>

            <img src={CalendarIcon} className="w-[30px] h-[30px]" />
          </div>

          {/* DatePicker (평상시에는 숨김) */}
          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            locale={ko}
            dateFormat="yyyy.MM.dd"
            className="hidden"
            
            customInput={
              <div className="absolute opacity-0 pointer-evets-none" />
            }

            /* ▼ 달력 아이콘 바로 아래 정렬 */
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
            ]}

            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
              <div className="flex justify-between items-center px-3 py-2 bg-[#F7F9FA] border-b border-gray-300 rounded-t-lg">

                <button
                  onClick={decreaseMonth}
                  className="px-3 py-1 text-sm text-gray-700 hover:text-black hover:bg-white border border-gray-300 rounded-md"
                >
                  이전
                </button>

                <span className="text-gray-800 font-semibold">
                  {date.getFullYear()}년 {date.getMonth() + 1}월
                </span>

                <button
                  onClick={increaseMonth}
                  className="px-3 py-1 text-sm text-gray-700 hover:text-black hover:bg-white border border-gray-300 rounded-md"
                >
                  다음
                </button>
              </div>
            )}
          />
        </div>

        {/* ---------------- 오른쪽 상태 필터 ---------------- */}
        <div className="flex items-center gap-4 text-[18px]">

          <button
            className={statusFilter === "접수" ? "text-[#25C310] font-bold" : "cursor-pointer"}
            onClick={() => setStatusFilter("접수")}
          >
            접수
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]"></div>

          <button
            className={statusFilter === "처리중" ? "text-[#FF3B3B] font-bold" : "cursor-pointer"}
            onClick={() => setStatusFilter("처리중")}
          >
            처리중
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]"></div>

          <button
            className={statusFilter === "완료" ? "text-[#367CFF] font-bold" : "cursor-pointer"}
            onClick={() => setStatusFilter("완료")}
          >
            완료
          </button>
        </div>
      </div>

      {/* ========================= 헤더 ========================= */}
      <div
        className="
          grid 
          grid-cols-[60px_80px_200px_1fr_200px_150px]
          h-[48px]
          bg-[#054E76]
          text-white
          text-[20px]
          font-bold
          items-center
        "
      >
        <div className="text-center">No.</div>

        <div className="flex justify-center cursor-pointer" onClick={toggleAll}>
          <div
            className="
              w-[25px] h-[25px]
              rounded-[3px]
              bg-[#D9D9D9]
              flex items-center justify-center
            "
          >
            {isAllChecked && (
              <img src={choiceIcon} className="w-[14px] h-[14px]" />
            )}
          </div>
        </div>

        <div className="text-center">아이디</div>
        <div className="text-center">내용</div>
        <div className="text-center">등록일</div>
        <div className="text-center">상태</div>
      </div>

      {/* ========================= 데이터 없음 ========================= */}
      {filteredData.length === 0 && (
        <div className="w-full py-10 text-center text-gray-400 text-[18px]">
          해당 데이터가 없습니다.
        </div>
      )}

      {/* ========================= 리스트 ========================= */}
      {filteredData.length > 0 &&
        filteredData.map((row, idx) => (
          <AlarmL
            key={row.id}
            row={row}
            checked={checkedRows[idx]}
            toggleRow={() => toggleRow(idx)}
          />
        ))}
    </div>
  );
}
