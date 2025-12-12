import { useState, useRef, useEffect } from "react";
import CheckL from "../Component/check_l.jsx";
import SearchIcon from "../../icons/Search_icon.png";
import CalendarIcon from "../../icons/calendar_icon.png";
import CheckForm from "../Component/check_form.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { ref, onValue, push, update } from "firebase/database";
import { rtdb } from "../../firebase/config.js";

/* 날짜 유틸 */
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

export default function CheckLog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  /* 필터 */
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);
  const [search, setSearch] = useState("");

  /* 폼 */
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);

  /* DB 로드 */
  useEffect(() => {
    const checkRef = ref(rtdb, "Check");

    return onValue(checkRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setData([]);
        setLoading(false);
        return;
      }

      const list = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));

      setData(list);
      setLoading(false);
    });
  }, []);

  /* 저장 */
  const handleFormSave = async (payload) => {
    // create 시 날짜 필수
    if (formMode === "create" && !payload.date) {
      alert("점검 날짜를 선택해주세요.");
      return;
    }

    if (formMode === "create") {
      const newItem = {
        title: payload.title,
        content: payload.content,
        date: payload.date,
        status: "미완료",
        checkType: payload.checkType ?? "상시",
        createdAt: Date.now(),
      };

      await push(ref(rtdb, "Check"), newItem);
    } else {
      const updateData = {
        title: payload.title,
        content: payload.content,
        status: payload.status,
        checkType: payload.checkType ?? "상시",
      };

      // 날짜를 실제로 바꿨을 때만
      if (payload.date && payload.date !== selectedRow?.date) {
        updateData.date = payload.date;
      }

      await update(ref(rtdb, `Check/${payload.id}`), updateData);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleItemClick = (row) => {
    setFormMode("edit");
    setSelectedRow(row);
    setFormOpen(true);
  };

  /* 필터 */
  let filtered = data;

  if (formattedDate) {
    filtered = filtered.filter((row) => row.date === formattedDate);
  }

  if (search.trim()) {
    filtered = filtered.filter(
      (row) =>
        row.title?.includes(search) ||
        row.content?.includes(search)
    );
  }

  /* 페이징 */
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const shown = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return (
      <div className="w-full text-center py-20 text-gray-500">
        데이터 불러오는 중...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px]">

      {/* 상단 필터 */}
      <div className="flex justify-between items-center mb-5 text-[18px]">
        <div className="flex items-center gap-4">
          <button
            className="text-[#054E76] font-semibold"
            onClick={() => {
              setSelectedDate(null);
              setSearch("");
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
            <span>
              날짜 {selectedDate ? formattedDate.replace(/-/g, ".") : todayDot()}
            </span>
            <img src={CalendarIcon} className="w-[30px]" />
          </div>

          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            locale={ko}
            dateFormat="yyyy.MM.dd"
            className="hidden"
          />

          {/* 검색 */}
          <div className="flex items-center gap-2 ml-2">
            <input
              className="border px-2 py-1 rounded w-[200px] text-center"
              placeholder="검색어"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} className="w-[35px]" />
          </div>
        </div>

        <button
          className="px-12 py-1 text-[20px] font-extrabold text-[#054E76]
          cursor-pointer"
          onClick={() => {
            setFormMode("create");
            setSelectedRow(null);
            setFormOpen(true);
          }}
        >
          글쓰기
        </button>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[60px_300px_1fr_200px_150px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center">
        <div className="text-center">No.</div>
        <div className="text-center">점검항목</div>
        <div className="text-center">내용</div>
        <div className="text-center">점검일</div>
        <div className="text-center">상태</div>
      </div>

      {/* 리스트 */}
      {shown.map((row, i) => (
        <CheckL
          key={row.id}
          row={row}
          index={(page - 1) * itemsPerPage + i}
          onClickItem={handleItemClick}
        />
      ))}

      {/* 페이징 */}
      <div className="flex justify-center gap-3 text-[18px] my-8">
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

      {/* 폼 */}
      {formOpen && (
        <CheckForm
          onClose={() => setFormOpen(false)}
          title="점검 입력"
          mode={formMode}
          row={selectedRow}
          onSave={handleFormSave}
        />
      )}

      {/* 토스트 */}
      {saved && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2
          bg-black text-white px-6 py-3 rounded-lg">
          저장되었습니다.
        </div>
      )}
    </div>
  );
}
