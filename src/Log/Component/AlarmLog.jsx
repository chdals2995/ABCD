import { useState, useRef } from "react";
import choiceIcon from "../../icons/choice_icon.png";
import CalendarIcon from "../../icons/calendar_icon.png";
import AlarmL from "./AlarmL.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../assets/Button";

// 날짜 유틸
function formatDate(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayDot() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function AlarmLog() {
  const [data, setData] = useState([
    { id: 1, user: "qeaowymu", content: "", date: "2025-10-13", status: "접수" },
    { id: 2, user: "evuopugh", content: "", date: "2025-04-05", status: "처리중" },
    { id: 3, user: "wbbtoafk", content: "", date: "2025-07-22", status: "처리중" },
    { id: 4, user: "k4xxdnh6", content: "", date: "2025-08-31", status: "접수" },
    { id: 5, user: "wev5peal", content: "", date: "2025-12-11", status: "완료" },
    { id: 6, user: "uuj5659d", content: "", date: "2025-12-11", status: "완료" },
    { id: 7, user: "mvq2adk3", content: "", date: "2025-03-19", status: "접수" },
    { id: 8, user: "xop9tqwe", content: "", date: "2025-01-27", status: "완료" },
    { id: 9, user: "alkd93md", content: "", date: "2025-06-14", status: "처리중" },
    { id: 10, user: "peo22xmv", content: "", date: "2025-09-02", status: "접수" },
  ]);

  /* 체크박스 */
  const [checkedRows, setCheckedRows] = useState(Array(data.length).fill(false));
  const [editMode, setEditMode] = useState(false);

  /* 날짜 필터 */
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  /* 상태 필터 */
  const [statusFilter, setStatusFilter] = useState(null);

  /* 토스트 메시지 */
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  /* 옵션 드롭다운 */
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* 필터 적용 */
  let filteredData = data;
  if (formattedDate) filteredData = filteredData.filter((row) => row.date === formattedDate);
  if (statusFilter) filteredData = filteredData.filter((row) => row.status === statusFilter);

  /* 페이징 */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* 체크박스 기능 */
  const toggleRow = (index) => {
    const updated = [...checkedRows];
    updated[index] = !updated[index];
    setCheckedRows(updated);
  };

  /* 상태 일괄 변경 */
  const handleBulkStatusChange = (newStatus) => {
    const updated = data.map((item, index) =>
      checkedRows[index] ? { ...item, status: newStatus } : item
    );

    setData(updated);

    /** 토스트 메시지 */
    setToastMsg(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">

      {/* 필터 */}
      <div className="flex justify-between items-center mb-4 text-[18px]">

        {/* 왼쪽 */}
        <div className="flex items-center gap-4">
          <button
            className="text-[#054E76] font-semibold"
            onClick={() => {
              setSelectedDate(null);
              setStatusFilter(null);
            }}
          >
            전체
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          <div className="flex items-center gap-2 cursor-pointer"
               onClick={() => datePickerRef.current.setOpen(true)}>
            <span className="font-[500]">
              날짜{" "}
              {selectedDate
                ? formatDate(selectedDate).replace(/-/g, ".")
                : todayDot()}
            </span>
            <img src={CalendarIcon} className="w-[30px] h-[30px]" />
          </div>

          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            locale={ko}
            dateFormat="yyyy.MM.dd"
            className="hidden"
            popperPlacement="bottom"
          />
        </div>

        {/* 오른쪽 상태필터 */}
        <div className="flex items-center gap-4 text-[18px]">
          <button className={statusFilter === "접수" ? "text-[#25C310] font-bold" : ""} onClick={() => setStatusFilter("접수")}>접수</button>
          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />
          <button className={statusFilter === "처리중" ? "text-[#FF3B3B] font-bold" : ""} onClick={() => setStatusFilter("처리중")}>처리중</button>
          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />
          <button className={statusFilter === "완료" ? "text-[#367CFF] font-bold" : ""} onClick={() => setStatusFilter("완료")}>완료</button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="
        grid grid-cols-[60px_80px_200px_1fr_200px_150px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center
      ">
        <div className="text-center">No.</div>

        {/* 전체 선택 체크박스 — 수정 모드일 때만 표시 */}
        <div className="flex justify-center">
        {editMode && (
        <div
          className="cursor-pointer"
          onClick={() => {
            const isAllChecked = checkedRows.every(Boolean);
            const newState = Array(data.length).fill(!isAllAllChecked);
            setCheckedRows(newState);
          }}
        >
          <div
            className="
              w-[25px] h-[25px]
              rounded-[3px]
              bg-[#C8C8C8]
              flex items-center justify-center
            "
          >
            {checkedRows.length > 0 &&
              checkedRows.every(Boolean) && (
                <img src={choiceIcon} className="w-[14px] h-[14px]" />
              )}
          </div>
        </div>
      )}
    </div>

        <div className="text-center">아이디</div>
        <div className="text-center">내용</div>
        <div className="text-center">등록일</div>
        <div className="text-center">상태</div>
      </div>

      {/* 리스트 */}
      {formattedDate && filteredData.length === 0 && (
        <div className="w-full py-10 text-center text-gray-400 text-[18px]">
          해당 날짜의 데이터가 존재하지 않습니다.
        </div>
      )}
      {paginatedData.map((row, idx) => (
        <AlarmL
          key={row.id}
          row={row}
          checked={checkedRows[idx]}
          toggleRow={() => toggleRow(idx)}
          editMode={editMode}
        />
      ))}

      {/* 페이지 + 수정버튼 */}
      <div className="flex justify-between items-center my-6">

        {/* 페이지 */}
        <div className="flex-1 flex justify-center gap-3 text-[18px]">
          <button onClick={() => setCurrentPage(1)}>{"<<"}</button>
          <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>{"<"}</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setCurrentPage(n)}
              className={currentPage === n ? "font-bold text-[#054E76]" : ""}>
              {n}
            </button>
          ))}

          <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>{">"}</button>
          <button onClick={() => setCurrentPage(totalPages)}>{">>"}</button>
        </div>

        {/* 수정 / 완료 / 옵션 */}
        <div className="flex items-center gap-3">

          {!editMode && (
            <Button onClick={() => setEditMode(true)}>
              수정
            </Button>
          )}

          {editMode && (
            <>
              <Button onClick={() => setEditMode(false)}>
                완료
              </Button>

              <div className="relative">
                <Button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  옵션 ▼
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 bg-white border shadow rounded w-[80px] text-center">
                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#25C310]"
                         onClick={() => handleBulkStatusChange("접수")}>
                      접수
                    </div>
                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#FF3B3B]"
                         onClick={() => handleBulkStatusChange("처리중")}>
                      처리중
                    </div>
                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#367CFF]"
                         onClick={() => handleBulkStatusChange("완료")}>
                      완료
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="
          fixed bottom-8 left-1/2 -translate-x-1/2
          bg-black text-white px-5 py-3 rounded-xl
          shadow-lg text-[16px] opacity-90
        ">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
