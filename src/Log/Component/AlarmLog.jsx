// AlarmLog.jsx
import { useState, useRef, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../../firebase/config";

import ChoiceIcon from "../../icons/choice_icon.png";
import CalendarIcon from "../../icons/calendar_icon.png";
import AlarmL from "./AlarmL.jsx";
import RequestArrival from "./request_arrival.jsx";   // ← 이름 통일

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

  // Firebase 데이터 로드
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

  // 체크 상태
  const [checkedRows, setCheckedRows] = useState({});
  const [editMode, setEditMode] = useState(false);

  // 날짜 필터
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  // 상태 필터
  const [statusFilter, setStatusFilter] = useState(null);

  // 모달 상태
  const [showArrival, setShowArrival] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // 내용 클릭 → RequestArrival 열기
  const openArrival = (row) => {
    setSelectedRow(row);
    setShowArrival(true);
  };

  // “보내기” 클릭 후 처리 (수신창 → 다음 단계)
  const handleNext = (status) => {
    update(ref(rtdb, `requests/${selectedRow.id}`), { status });

    setShowArrival(false);

    // 여기서 Response 모달로 넘어갈 예정
    console.log("→ 다음: Response 모달 예정");
  };

  // 데이터 필터링
  let filteredData = [...data];
  if (formattedDate) filteredData = filteredData.filter((r) => r.date === formattedDate);
  if (statusFilter) filteredData = filteredData.filter((r) => r.status === statusFilter);

  // 페이징
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const shown = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setTimeout(() => setPage(1), 0);
  }, [statusFilter, selectedDate]);

  // 페이지 보정
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setTimeout(() => setPage(totalPages), 0);
    }
    if (totalPages === 0) {
      setTimeout(() => setPage(1), 0);
    }
  }, [page, totalPages]);

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">

      {/* 상단 필터 */}
      <div className="flex justify-between items-center mb-4 text-[18px]">
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

          {/* 날짜 선택 */}
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
      <div className="
        grid grid-cols-[60px_60px_180px_1.1fr_180px_120px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center
      ">
        <div className="text-center">No.</div>
        <div></div>
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
          onClickContent={() => openArrival(row)}  // ← RequestArrival 연결됨
        />
      ))}

      {/* 페이징 */}
      <div className="flex justify-center gap-3 text-[18px] my-6">
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

      {/* 🔥 RequestArrival 모달 */}
      {showArrival && selectedRow && (
        <RequestArrival
          data={selectedRow}
          onClose={() => setShowArrival(false)}
          onNext={handleNext}
        />
      )}

    </div>
  );
}
