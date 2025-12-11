// AlarmLog.jsx
import { useState, useRef, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../../firebase/config";

import CalendarIcon from "../../icons/calendar_icon.png";
import AlarmL from "../Component/alarm_l.jsx";
import RequestArrival from "../Component/request_arrival.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function AlarmLog() {
  const [data, setData] = useState([]);

  // DB 로드
  useEffect(() => {
    const requestsRef = ref(rtdb, "requests");

    return onValue(requestsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return setData([]);

      const list = Object.entries(val).map(([id, item]) => ({
        id,
        user: item.user ?? "",
        content: item.content ?? "",
        date: item.date ?? "",
        status: item.status ?? "접수",
      }));

      list.sort((a, b) => (a.date > b.date ? -1 : 1));
      setData(list);
    });
  }, []);

  // 필터
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const datePickerRef = useRef(null);

  const formattedDate = formatDate(selectedDate);

  let filtered = [...data];
  if (formattedDate) filtered = filtered.filter((r) => r.date === formattedDate);
  if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);

  // 수정모드
  const [editMode, setEditMode] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleRow = (id) => {
    setCheckedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 페이징
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const shown = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleAllCurrentPage = () => {
    const allOn = shown.every((r) => checkedRows[r.id]);
    const next = { ...checkedRows };

    shown.forEach((r) => {
      next[r.id] = !allOn;
    });

    setCheckedRows(next);
  };

  // 수신창
  const [showArrival, setShowArrival] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const openArrival = (row) => {
    if (editMode) return; // 수정 모드일 땐 클릭 막기
    setSelectedRow(row);
    setShowArrival(true);
  };

  // 수신창에서 “보내기” 눌렀을 때 (필요하면 나중에 수정)
  const handleNext = (newStatus) => {
    update(ref(rtdb, `requests/${selectedRow.id}`), { status: newStatus });
    setShowArrival(false);
  };

  // 토스트
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  // 상태 변경 (옵션 → 바로 DB 반영)
  const changeStatus = (newStatus) => {
    let changed = 0;

    Object.entries(checkedRows).forEach(([id, checked]) => {
      if (checked) {
        changed += 1;
        update(ref(rtdb, `requests/${id}`), { status: newStatus });
      }
    });

    if (changed === 0) {
      showToast("선택된 항목이 없습니다.");
    } else {
      showToast(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
    }

    setDropdownOpen(false);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">

      {/* 필터 */}
      <div className="flex justify-between items-center mb-4 text-[18px]">
        {/* 왼쪽 필터 */}
        <div className="flex items-center gap-4">
          <button
            className="text-[#054E76] font-semibold hover:text-[#033854]"
            onClick={() => {
              setSelectedDate(null);
              setStatusFilter(null);
            }}
          >
            전체
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-70"
            onClick={() => datePickerRef.current.setOpen(true)}
          >
            <span>
              날짜 {selectedDate ? formattedDate.replace(/-/g, ".") : todayDot()}
            </span>
            <img src={CalendarIcon} className="w-[28px]" />
          </div>

          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            locale={ko}
            className="hidden"
          />
        </div>

        {/* 상태 필터 + 구분선 */}
        <div className="flex items-center gap-4 text-[18px]">
          {["접수", "처리중", "완료"].map((t, idx) => (
            <div key={t} className="flex items-center gap-4">
              <button
                onClick={() => setStatusFilter(t)}
                className={`hover:opacity-70 ${
                  statusFilter === t &&
                  (t === "접수"
                    ? "text-[#25C310] font-bold"
                    : t === "처리중"
                    ? "text-[#FF3B3B] font-bold"
                    : "text-[#367CFF] font-bold")
                }`}
              >
                {t}
              </button>
              {idx < 2 && <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />}
            </div>
          ))}
        </div>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[60px_60px_180px_1.2fr_180px_120px] h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center">
        <div className="text-center">No.</div>

        <div className="flex justify-center">
          {editMode && (
            <div
              className="w-[25px] h-[25px] bg-white/40 rounded cursor-pointer"
              onClick={toggleAllCurrentPage}
            />
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
          editMode={editMode}
          checked={!!checkedRows[row.id]}
          toggleRow={() => toggleRow(row.id)}
          onClickContent={() => openArrival(row)}
        />
      ))}

      {/* 페이징 + 수정 */}
      <div className="flex justify-between items-center my-6">
        {/* 페이징 */}
        <div className="flex flex-1 justify-center gap-3 text-[18px]">
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
          <button onClick={() => setPage(totalPages)}>{">>"}</button>
        </div>

        {/* 수정 / 옵션 / 완료 */}
        <div className="flex items-center gap-3 mr-5">
          {!editMode && (
            <button
              className="px-4 py-2 bg-[#054E76] text-white rounded hover:opacity-80"
              onClick={() => setEditMode(true)}
            >
              수정
            </button>
          )}

          {editMode && (
            <>
              <div className="relative">
                <button
                  className="px-4 py-2 bg-[#054E76] text-white rounded hover:opacity-80"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  옵션 ▼
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 bg-white border shadow w-[90px] text-center">
                    <div
                      className="py-2 hover:bg-gray-100 cursor-pointer text-[#25C310]"
                      onClick={() => changeStatus("접수")}
                    >
                      접수
                    </div>
                    <div
                      className="py-2 hover:bg-gray-100 cursor-pointer text-[#FF3B3B]"
                      onClick={() => changeStatus("처리중")}
                    >
                      처리중
                    </div>
                    <div
                      className="py-2 hover:bg-gray-100 cursor-pointer text-[#367CFF]"
                      onClick={() => changeStatus("완료")}
                    >
                      완료
                    </div>
                  </div>
                )}
              </div>

              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:opacity-80"
                onClick={() => {
                  setEditMode(false);
                  setCheckedRows({});
                  setDropdownOpen(false);
                }}
              >
                완료
              </button>
            </>
          )}
        </div>
      </div>

      {/* 수신 모달 */}
      {showArrival && selectedRow && (
        <RequestArrival
          data={selectedRow}
          onClose={() => setShowArrival(false)}
          onNext={handleNext}
        />
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-xl shadow-lg text-[16px] opacity-90">
          {toast}
        </div>
      )}
    </div>
  );
}
