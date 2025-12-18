import { useState, useRef, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../firebase/config.js";

import CalendarIcon from "../assets/icons/calendar_icon.png";
import choiceIcon from "../assets/icons/choice_icon.png";

import AlarmL from "../Log/alarm_l.jsx";
import RequestArrival from "../Log/request_arrival.jsx";
import Response from "../Log/Response.jsx";
import Button from "../assets/Button.jsx";

import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker_override.css";

/* ================= userCode 유틸 ================= */
function generateUserCode(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/* ================= 상태 컬러 ================= */
const STATUS_COLOR = {
  접수: "text-[#25C310]",
  처리중: "text-[#FF3B3B]",
  완료: "text-[#367CFF]",
};

const STATUS_NEXT = {
  접수: "처리중",
  처리중: "완료",
  완료: "접수",
};

/* ================= 날짜 유틸 ================= */
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

  /* ================= DB 로드 ================= */
  useEffect(() => {
    const requestsRef = ref(rtdb, "requests");

    return onValue(requestsRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setData([]);
        return;
      }

      const updates = {};
      const list = Object.entries(val).map(([id, item]) => {
        let userCode = item.userCode;
        if (!userCode) {
          userCode = generateUserCode();
          updates[`requests/${id}/userCode`] = userCode;
        }

        return {
          id,
          userCode,
          user: item.user ?? "",
          title: item.title ?? "",
          content: item.content ?? "",
          date: item.date ?? "",
          status: item.status ?? "접수",
          building: item.building ?? "",
          floor: item.floor ?? "",
          type: item.type ?? "",
          reply: item.reply ?? null,
        };
      });

      if (Object.keys(updates).length > 0) {
        update(ref(rtdb), updates);
      }

      list.sort((a, b) => (a.date > b.date ? -1 : 1));
      setData(list);
    });
  }, []);

  /* ================= 필터 ================= */
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const datePickerRef = useRef(null);
  const formattedDate = formatDate(selectedDate);

  let filtered = [...data];
  if (formattedDate) filtered = filtered.filter((r) => r.date === formattedDate);
  if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);

  /* ================= 수정모드 ================= */
  const [editMode, setEditMode] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const toggleRow = (id) =>
    setCheckedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const cancelEdit = () => {
    setEditMode(false);
    setCheckedRows({});
    setPendingStatus(null);
    setDropdownOpen(false);
  };

  /* ================= 페이징 ================= */
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  const shown = filtered.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const toggleAllCurrentPage = () => {
    const allOn = shown.length > 0 && shown.every((r) => checkedRows[r.id]);
    const next = { ...checkedRows };
    shown.forEach((r) => (next[r.id] = !allOn));
    setCheckedRows(next);
  };

  /* ================= 모달 ================= */
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const openRequest = (row) => {
    if (editMode) return;
    setShowResponse(false);
    setSelectedRow(row);
    setShowRequest(true);
  };

  /* ================= 상태 변경 미니 안내 ================= */
  const [statusHint, setStatusHint] = useState("");

  const handleToggleStatus = (row) => {
    const next = STATUS_NEXT[row.status];
    update(ref(rtdb, `requests/${row.id}`), { status: next });

    // 🔕 토스트 대신 작은 안내 문구
    setStatusHint(`상태가 '${next}'로 변경되었습니다.`);
    setTimeout(() => setStatusHint(""), 1500);
  };

  /* ================= 일괄 상태 변경 ================= */
  const changeStatus = (newStatus) => {
    setPendingStatus(newStatus);
    setDropdownOpen(false);
  };

  const applyChanges = () => {
    if (!pendingStatus) return;

    let changed = 0;
    Object.entries(checkedRows).forEach(([id, checked]) => {
      if (checked) {
        changed += 1;
        update(ref(rtdb, `requests/${id}`), { status: pendingStatus });
      }
    });

    if (changed > 0) {
      setStatusHint(`상태가 '${pendingStatus}'로 변경되었습니다.`);
      setTimeout(() => setStatusHint(""), 1500);
    }

    cancelEdit();
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">
      {/* ================= 필터 ================= */}
      <div className="flex justify-between items-center mb-4 text-[18px]">
        <div className="flex items-center gap-4">
          <button
            className="text-[#054E76] font-semibold cursor-pointer"
            onClick={() => {
              setSelectedDate(null);
              setStatusFilter(null);
              setPage(1);
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
            <img src={CalendarIcon} className="w-[28px]" />
          </div>

          <DatePicker
            ref={datePickerRef}
            selected={selectedDate}
            onChange={(d) => {
              setSelectedDate(d);
              setPage(1);
            }}
            locale={ko}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-4">
          {["접수", "처리중", "완료"].map((t, idx) => (
            <div key={t} className="flex items-center gap-4">
              <button
                onClick={() => {
                  setStatusFilter(t);
                  setPage(1);
                }}
                className={`cursor-pointer ${
                  statusFilter === t ? `${STATUS_COLOR[t]} font-bold` : ""
                }`}
              >
                {t}
              </button>
              {idx < 2 && <div className="w-[2px] h-[20px] bg-[#B5B5B5]" />}
            </div>
          ))}
        </div>
      </div>

      {/* ================= 헤더 ================= */}
      <div className="grid grid-cols-[60px_60px_180px_1.2fr_180px_120px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center">
        <div className="text-center">No.</div>
        <div className="flex justify-center">
          {editMode && (
            <div
              className="w-[25px] h-[25px] bg-white/40 rounded flex items-center justify-center cursor-pointer"
              onClick={toggleAllCurrentPage}
            >
              {shown.length > 0 && shown.every((r) => checkedRows[r.id]) && (
                <img src={choiceIcon} className="w-[14px] h-[14px]" />
              )}
            </div>
          )}
        </div>
        <div className="text-center">아이디</div>
        <div className="text-center">내용</div>
        <div className="text-center">등록일</div>
        <div className="text-center">상태</div>
      </div>

      {/* ================= 리스트 ================= */}
      {shown.map((row, idx) => (
        <AlarmL
          key={row.id}
          row={row}
          index={(safePage - 1) * itemsPerPage + idx + 1}
          editMode={editMode}
          checked={!!checkedRows[row.id]}
          toggleRow={() => toggleRow(row.id)}
          onClickContent={() => openRequest(row)}
          onToggleStatus={() => handleToggleStatus(row)}
        />
      ))}

  

     {/* ================= 하단 컨트롤 바 ================= */}
    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center">
      
      {/* 왼쪽 (비워둠 – 정렬용) */}
      <div />

      {/* 가운데: 페이징 + 상태 안내 */}
      <div className="flex flex-col items-center gap-2">
        {totalPages > 1 && (
          <div className="flex items-center gap-3 text-[18px]">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="px-2 cursor-pointer disabled:opacity-30"
            >
              {"<<"}
            </button>

            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2 cursor-pointer disabled:opacity-30"
            >
              {"<"}
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2 cursor-pointer ${
                    safePage === p ? "text-[#054E76] font-bold" : ""
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2 cursor-pointer disabled:opacity-30"
            >
              {">"}
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="px-2 cursor-pointer disabled:opacity-30"
            >
              {">>"}
            </button>
          </div>
        )}

        {/* 상태 변경 안내 (자리 고정) */}
        <div className="h-[22px] text-[17px] text-gray-500">
          {statusHint}
        </div>
      </div>

      {/* 오른쪽: 수정 버튼 */}
      <div className="flex justify-end  mr-[20px] mb-13">
        {!editMode && <Button onClick={() => setEditMode(true)}>수정</Button>}

        {editMode && (
          <div className="flex gap-3">
            <div className="relative w-[90px]">
              <Button onClick={() => setDropdownOpen(!dropdownOpen)}>
                옵션 ▼
              </Button>
              {dropdownOpen && (
                <div className="absolute right-0 w-[90px] bg-white border shadow text-center">
                  {["접수", "처리중", "완료"].map((s) => (
                    <div
                      key={s}
                      onClick={() => changeStatus(s)}
                      className={`py-2 cursor-pointer ${STATUS_COLOR[s]}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={cancelEdit}>취소</Button>
            <Button onClick={applyChanges}>완료</Button>
          </div>
        )}
      </div>
    </div>

      {/* ================= 모달 ================= */}
      {selectedRow && showRequest && (
        <RequestArrival
          data={selectedRow}
          onClose={() => setShowRequest(false)}
          onReply={() => {
            setShowRequest(false);
            setShowResponse(true);
          }}
        />
      )}

      {selectedRow && showResponse && (
        <Response
          data={selectedRow}
          mode="reply"
          onClose={() => setShowResponse(false)}
          onSend={async (payload) => {
            const replyContent =
              typeof payload === "string" ? payload : payload?.content ?? "";
            const replyTitle =
              typeof payload === "string"
                ? selectedRow.title ?? ""
                : payload?.title ?? selectedRow.title ?? "";

            if (!replyContent.trim()) return;

            await update(ref(rtdb, `requests/${selectedRow.id}`), {
              status: "완료",
              reply: {
                title: replyTitle,
                content: replyContent,
                createdAt: Date.now(),
                sender: "admin",
              },
            });

            setShowResponse(false);
          }}
        />
      )}
    </div>
  );
}
