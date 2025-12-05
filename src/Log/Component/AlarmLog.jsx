// AlarmLog.jsx
import { useState,useRef } from "react";
import choiceIcon from "../../icons/choice_icon.png"; 
import CalendarIcon from "../../icons/Calendar_icon.png";
import AlarmL from "./AlarmL.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";


export default function AlarmLog() {
  
  const data = [
    { id: 1, user: "qeaowymu", content: "", date: "2024-10-13", status: "접수" },
    { id: 2, user: "evuopugh", content: "", date: "2021-04-05", status: "처리중" },
    { id: 3, user: "wbbtoafk", content: "", date: "2022-07-22", status: "처리중" },
    { id: 4, user: "k4xxdnh6", content: "", date: "2025-08-31", status: "접수" },
    { id: 5, user: "wev5peal", content: "", date: "2019-12-11", status: "완료" },
  ];

  const [checkedRows, setCheckedRows] = useState(Array(data.length).fill(false));
  const [isAllChecked, setIsAllChecked] = useState(false);

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

  // 날짜 상태 만들기 
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);

  return (
    <div className="w-full max-w-[1100px] mx-auto overflow-x-hidden mt-[101px] mb-[40px]">

      {/* 필터 영역 */}
      <div className="flex justify-between items-center mb-4 text-[18px]">

       {/* 왼쪽 필터영역 */}
       <div className="flex items-center gap-4">

        {/* 전체 */}
        <button className="text-[#054E76] font-semibold">
          전체
        </button>

        {/* 구분선 */}
        <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>

  

        {/* 날짜 선택  */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => datePickerRef.current.setOpen(true)}>
          <span className="text-gray-600">
            날짜 {selectedDate ? selectedDate.toISOString().slice(0,10).replace(/-/g,".") : "2025.01.01"}
          </span>

          <img 
            src={CalendarIcon}
            alt={"달력 아이콘"}
            className="w-[35px] h-[35px]"
            
            />
          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            locale={ko}
            className="hidden"
            dateFormat="yyyy.MM.dd"
            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => 
              (
            <div className="flex justify-between items-center px-3 py-2 bg-[#F7F9FA] border-b border-gray-300 rounded-t-lg">

            {/* 이전 달 버튼 */}
            <button
              onClick={decreaseMonth}
              className="p-2 rounded-md hover:bg-white border border-gray-300"
            >
            이전
            </button>

            {/* 월/연도 표시 */}
            <span className="text-gray-800 font-semibold text-[16px]">
              {date.getFullYear()}년 {date.getMonth() + 1}월
            </span>

            {/* 다음 달 버튼 */}
            <button
              onClick={increaseMonth}
              className="p-2 rounded-md hover:bg-white border border-gray-300"
            >
             다음
            </button>
        </div>
      )}
    />
  </div>

       </div>
        {/* 오른쪽 처리현황 필터 */}
        <div className="flex items-center gap-4 text-[18px]">

          <button>접수</button>

          {/* 구분선 */}
          <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>

          <button>처리중</button>

          {/* 구분선 */}
          <div className="w-[2px] h-[20px] bg-[#b5b5b5]"></div>

          <button>완료</button>

        </div>


      </div>

      {/* 파란 헤더 — flex → grid로 변경 */}
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

        {/* 전체 체크박스 */}
          <div
            className="flex justify-center cursor-pointer"
            onClick={toggleAll}
          >
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

      {/* 리스트 */}
      {data.map((row, idx) => (
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
