import { useState, useRef } from "react";
import CheckL from "../../Log/Component/CheckL.jsx";
import SearchIcon from "../../icons/Search_icon.png";
import CalendarIcon from "../../icons/calendar_icon.png";
import CheckForm from "../../Log/Component/CheckForm.jsx";

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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function CheckLog() {
  const [data, setData] = useState([
    { id: 1, title: "전기 점검", content: "배전반 점검 필요", date: "2025-06-05", status: "완료" },
    { id: 2, title: "냉난방 점검", content: "에어컨 필터 교체", date: "2019-04-02", status: "완료" },
    { id: 3, title: "수도/배관 점검", content: "배관 누수 확인", date: "2022-05-12", status: "미완료" },
    { id: 4, title: "가스 점검", content: "누출 테스트 필요", date: "2025-11-16", status: "완료" },
    { id: 5, title: "건물 내부 기본 점검", content: "계단 조명 교체", date: "2024-12-08", status: "미완료" },
  ]);

  /* 날짜 필터 */
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  /* 검색 */
  const [search, setSearch] = useState("");

  /* 모달 상태 */
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [selectedRow, setSelectedRow] = useState(null);

  /* 입력 저장 */
  const handleFormSave = (payload) => {
    if (formMode === "create") {
      const newId = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1;
      const newItem = {
        id: newId,
        title: payload.title,
        content: payload.content,
        date: formatDate(new Date()), // 오늘 날짜 저장
        status: "미완료",
      };
      setData((prev) => [...prev, newItem]);
    } else if (formMode === "edit" && payload.id) {
      setData((prev) =>
        prev.map((item) =>
          item.id === payload.id
            ? { ...item, title: payload.title, content: payload.content }
            : item
        )
      );
    }
  };

  /* 항목 클릭 */
  const handleItemClick = (row) => {
    setFormMode("edit");
    setSelectedRow(row);
    setFormOpen(true);
  };

  /* 필터 적용 */
  let filtered = data;

  if (formattedDate) {
    filtered = filtered.filter((row) => row.date === formattedDate);
  }

  if (search.trim() !== "") {
    filtered = filtered.filter(
      (row) => row.title.includes(search) || row.content.includes(search)
    );
  }

  /* 페이징 */
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const shown = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px]">

      {/* 상단 필터 영역 */}
      <div className="flex justify-between items-center mb-5 text-[18px]">

        {/* 왼쪽: 전체 | 날짜 | 검색 */}
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
          />

          {/* 검색 */}
          <div className="flex items-center gap-2 ml-2">
            <input
              className="border px-2 py-1 rounded w-[200px] text-[17px] text-center"
              placeholder="검색어를 입력하세요."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={SearchIcon} className="w-[35px]" />
          </div>
        </div>

        {/* 글쓰기 */}
        <button
          className="px-12 py-1 font-extrabold text-[20px] text-[#054E76]"
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
      <div
        className="
        grid grid-cols-[60px_300px_1fr_200px_150px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center
      "
      >
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
          index={i}
          onClickItem={handleItemClick}
        />
      ))}

      {/* 안내 문구 */}
      <div className="text-center text-gray-500 text-[15px] mt-4">
        ※ 점검항목을 클릭하면 해당 항목이 입력창 제목으로 자동 설정됩니다.
      </div>

      {/* 페이지네이션 */}
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

      {/* 모달 */}
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
