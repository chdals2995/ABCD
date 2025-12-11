// AlarmLog.jsx
import { useState, useRef, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../../firebase/config";

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
  const [data, setData] = useState([]);

  // ✔ Firebase 데이터 받아오기
  useEffect(() => {
    const requestsRef = ref(rtdb, "requests");

    return onValue(requestsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setData([]);
        return;
      }

      const list = Object.entries(val).map(([id, item]) => ({
        id,
        user: item.user || "",
        content: item.content || "",
        date: item.date || "",
        status: item.status || "접수",
      }));

      list.sort((a, b) => (a.date > b.date ? -1 : 1));

      setData(list);
    });
  }, []);

  /* 체크박스 (id 기준) */
  const [checkedRows, setCheckedRows] = useState({});
  const [editMode, setEditMode] = useState(false);

  /* 날짜 필터 */
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  /* 상태 필터 */
  const [statusFilter, setStatusFilter] = useState(null);

  /* 토스트 */
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  /* 드롭다운 */
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* 필터 적용 */
  let filteredData = [...data];
  if (formattedDate) filteredData = filteredData.filter((r) => r.date === formattedDate);
  if (statusFilter) filteredData = filteredData.filter((r) => r.status === statusFilter);

  /* 페이징 */
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const shown = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  /* 👉 필터 바뀌면 페이지를 1로 초기화 */
  useEffect(() => {
    setTimeout(() => setPage(1), 0);
  }, [statusFilter, selectedDate]);


  /* 👉 페이지가 범위를 벗어나면 자동 보정 */
  useEffect(() => {
  if (page > totalPages && totalPages > 0) {
    setTimeout(() => setPage(totalPages), 0);
  }
  if (totalPages === 0) {
    setTimeout(() => setPage(1), 0);
  }
  }, [page, totalPages]);


  /* 체크박스 토글 (id 사용) */
  const toggleRow = (id) => {
    setCheckedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* 현재 페이지 전체 선택 */
  const toggleAllCurrentPage = () => {
    setCheckedRows((prev) => {
      const allChecked = shown.every((row) => prev[row.id]);
      const next = { ...prev };
      shown.forEach((row) => {
        next[row.id] = !allChecked;
      });
      return next;
    });
  };

  /* 상태 변경 + Firebase 업데이트 */
  const changeStatus = (newStatus) => {
    const updated = data.map((item) =>
      checkedRows[item.id] ? { ...item, status: newStatus } : item
    );
    setData(updated);

    Object.entries(checkedRows).forEach(([id, checked]) => {
      if (checked) {
        update(ref(rtdb, `requests/${id}`), { status: newStatus });
      }
    });

    setToastMsg(`상태가 '${newStatus}'로 변경되었습니다.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">

      {/* 상단 필터 */}
      <div className="flex justify-between items-center mb-4 text-[18px]">
        <div className="flex items-center gap-4">
          <button
            className="text-[#054E76] font-semibold cursor-pointer"
            onClick={() => {
              setSelectedDate(null);
              setStatusFilter(null);
            }}
          >
            전체
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          {/* 날짜 */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => datePickerRef.current.setOpen(true)}
          >
            <span className="font-[500]">
              날짜 {selectedDate ? formattedDate.replace(/-/g, ".") : todayDot()}
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
          />
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-4 text-[18px]">
          <button
            className={statusFilter === "접수" ? "text-[#25C310] font-bold" : ""}
            onClick={() => setStatusFilter("접수")}
          >
            접수
          </button>
          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          <button
            className={statusFilter === "처리중" ? "text-[#FF3B3B] font-bold" : ""}
            onClick={() => setStatusFilter("처리중")}
          >
            처리중
          </button>
          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          <button
            className={statusFilter === "완료" ? "text-[#367CFF] font-bold" : ""}
            onClick={() => setStatusFilter("완료")}
          >
            완료
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div
        className="
          grid grid-cols-[60px_60px_180px_1.1fr_180px_120px]
          h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center
        "
      >
        <div className="text-center">No.</div>

        {/* 전체 체크 */}
        <div className="flex justify-center">
          {editMode && (
            <div onClick={toggleAllCurrentPage} className="cursor-pointer">
              <div className="w-[25px] h-[25px] bg-[#C8C8C8] rounded-[3px] flex items-center justify-center">
                {shown.length > 0 && shown.every((r) => checkedRows[r.id]) && (
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
      {shown.map((row, idx) => (
        <AlarmL
          key={row.id}
          row={row}
          index={(page - 1) * itemsPerPage + idx}
          checked={!!checkedRows[row.id]}
          toggleRow={() => toggleRow(row.id)}
          editMode={editMode}
        />
      ))}

      {/* 페이지 + 수정 */}
      <div className="flex justify-between items-center my-6">

        {/* 페이지 */}
        <div className="flex-1 flex justify-center gap-3 text-[18px]">
          <button onClick={() => setPage(1)}>{"<<"}</button>
          <button onClick={() => page > 1 && setPage(page - 1)}>{"<"}</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={page === n ? "font-bold text-[#054E76]" : ""}
            >
              {n}
            </button>
          ))}

          <button onClick={() => page < totalPages && setPage(page + 1)}>{">"}</button>
          <button onClick={() => setPage(totalPages)}> {">>"} </button>
        </div>

        {/* 수정모드 */}
        <div className="flex items-center gap-3">
          {!editMode && <Button onClick={() => setEditMode(true)}>수정</Button>}

          {editMode && (
            <>
              <Button onClick={() => setEditMode(false)}>완료</Button>

              <div className="relative">
                <Button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  옵션 ▼
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 bg-white border shadow rounded w-[80px] text-center">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#25C310]"
                      onClick={() => {
                        changeStatus("접수");
                        setDropdownOpen(false);
                      }}
                    >
                      접수
                    </div>

                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#FF3B3B]"
                      onClick={() => {
                        changeStatus("처리중");
                        setDropdownOpen(false);
                      }}
                    >
                      처리중
                    </div>

                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-[#367CFF]"
                      onClick={() => {
                        changeStatus("완료");
                        setDropdownOpen(false);
                      }}
                    >
                      완료
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 토스트 */}
      {showToast && (
        <div
          className="
          fixed bottom-8 left-1/2 -translate-x-1/2
          bg-black text-white px-5 py-3 rounded-xl shadow-lg text-[16px] opacity-90
        "
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
