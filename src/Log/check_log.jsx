import { useState, useRef, useEffect } from "react";
import CheckL from "../Log/check_l.jsx";
import SearchIcon from "../assets/icons/Search_icon.png";
import CalendarIcon from "../assets/icons/calendar_icon.png";
import CheckForm from "../Log/check_form.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { ref, onValue, push, update } from "firebase/database";
import { rtdb } from "../firebase/config.js";

import Button from "../assets/Button.jsx";
import "./datepicker_override.css";

/* 날짜 유틸 */
function formatDate(d) {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayDot() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function CheckLog() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== 필터 ===== */
  const [selectedDate, setSelectedDate] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  // "상시" | "정기" | "미완료" | "완료" | null

  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  /* ===== 폼 ===== */
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedRow, setSelectedRow] = useState(null);

  /* ===== DB 로드 ===== */
  useEffect(() => {
    const todosRef = ref(rtdb, "todos");

    return onValue(todosRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setData([]);
        setLoading(false);
        return;
      }

      const list = Object.entries(val).map(([id, v]) => ({
        id,
        title: v.title ?? v.target ?? "",
        content: v.content ?? v.description ?? "",
        date: v.date ?? null,
        status: v.status ?? (v.done ? "완료" : "미완료"),
        checkType: v.checkType ?? "상시",
        createdAt: v.createdAt ?? 0,
      }));

      setData(list);
      setLoading(false);
    });
  }, []);

  /* ===== 저장 / 수정 ===== */
  const handleFormSave = async (payload) => {
    const finalDate = payload.date ?? todayStr();
    const todosRef = ref(rtdb, "todos");

    if (formMode === "create") {
      await push(todosRef, {
        title: payload.title,
        content: payload.content,
        date: finalDate,
        status: "미완료",
        checkType: payload.checkType ?? "상시",
        createdAt: Date.now(),
      });
    } else {
      await update(ref(rtdb, `todos/${payload.id}`), {
        title: payload.title,
        content: payload.content,
        date: finalDate,
        checkType: payload.checkType ?? "상시",
        updatedAt: Date.now(),
      });
    }
  };

  const handleItemClick = (row) => {
    setFormMode("edit");
    setSelectedRow(row);
    setFormOpen(true);
  };

  /* ===== 필터 적용 (단일 필터) ===== */
  let filtered = data;

  if (formattedDate) {
    filtered = filtered.filter((row) => row.date === formattedDate);
  }

  if (search.trim()) {
    filtered = filtered.filter(
      (row) =>
        row.title.includes(search) ||
        row.content.includes(search)
    );
  }

  if (activeFilter) {
    filtered = filtered.filter(
      (row) =>
        row.checkType === activeFilter ||
        row.status === activeFilter
    );
  }

  /* ===== 페이징 ===== */
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
            className="text-[#054E76] font-semibold cursor-pointer"
            onClick={() => {
              setSelectedDate(null);
              setSearch("");
              setActiveFilter(null);
            }}
          >
            전체
          </button>

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

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

          <div className="flex items-center gap-2 ml-2">
            <input
              className="border px-2 py-1 rounded w-[200px] text-center"
              placeholder="검색어"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} className="w-[35px] cursor-pointer" />
          </div>
        </div>

        {/* 우측 필터 (단일) */}
        <div className="flex items-center gap-4">
          {["상시", "정기"].map((t) => (
            <button
              key={t}
              onClick={() =>
                setActiveFilter(activeFilter === t ? null : t)
              }
              className={`cursor-pointer ${
                activeFilter === t
                  ? "text-[#054E76] font-bold"
                  : "text-gray-400"
              }`}
            >
              {t} 점검
            </button>
          ))}

          <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />

          {["미완료", "완료"].map((s) => (
            <button
              key={s}
              onClick={() =>
                setActiveFilter(activeFilter === s ? null : s)
              }
              className={`cursor-pointer ${
                activeFilter === s
                  ? s === "완료"
                    ? "text-[#0E5FF0] font-bold"
                    : "text-[#CA3535] font-bold"
                  : "text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[60px_300px_1fr_200px_150px] h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center">
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

      {/* 페이징 + 글쓰기 */}
      <div className="flex justify-between items-center my-8">
        <div className="w-[120px]" />

        <div className="flex justify-center gap-3 text-[18px]">
          <button className="cursor-pointer" onClick={() => setPage(1)}>{"<<"}</button>
          <button className="cursor-pointer" onClick={() => page > 1 && setPage(page - 1)}>{"<"}</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={page === n ? "font-bold text-[#054E76]" : "cursor-pointer"}
            >
              {n}
            </button>
          ))}

          <button className="cursor-pointer" onClick={() => page < totalPages && setPage(page + 1)}>{">"}</button>
          <button className="cursor-pointer" onClick={() => setPage(totalPages)}>{">>"}</button>
        </div>

        <div className="w-[120px] flex justify-end mr-8 mb-1">
          <Button
            onClick={() => {
              setFormMode("create");
              setSelectedRow(null);
              setFormOpen(true);
            }}
          >
            글쓰기
          </Button>
        </div>
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
    </div>
  );
}
