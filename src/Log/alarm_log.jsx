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

  /* ================= 페이징 (단일 페이지 고정) ================= */
  const itemsPerPage = 6;
  const [page] = useState(1); // setPage 제거 (ESLint 해결)
  const shown = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  /* ================= 토스트 ================= */
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  /* ================= 상태 변경 ================= */
  const changeStatus = (newStatus) => {
    setPendingStatus(newStatus);
    setDropdownOpen(false);
    showToast(`상태 '${newStatus}' 로 변경하려면 완료를 누르세요.`);
  };

  const applyChanges = () => {
    if (!pendingStatus) {
      showToast("변경할 상태를 선택하세요.");
      return;
    }

    let changed = 0;
    Object.entries(checkedRows).forEach(([id, checked]) => {
      if (checked) {
        changed += 1;
        update(ref(rtdb, `requests/${id}`), { status: pendingStatus });
      }
    });

    if (changed === 0) {
      showToast("선택된 항목이 없습니다.");
      return;
    }

    showToast("수정이 완료되었습니다.");
    cancelEdit();
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-[30px] mb-[40px]">
      {/* ================= 필터 ================= */}
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
            onChange={(d) => setSelectedDate(d)}
            locale={ko}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-4">
          {["접수", "처리중", "완료"].map((t, idx) => (
            <div key={t} className="flex items-center gap-4">
              <button
                onClick={() => setStatusFilter(t)}
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

      {/* ================= 헤더 (파란바) ================= */}
      <div className="grid grid-cols-[60px_60px_180px_1.2fr_180px_120px]
        h-[48px] bg-[#054E76] text-white text-[20px] font-bold items-center">
        <div className="text-center">No.</div>
        <div className="flex justify-center">
          {editMode && (
            <div
              className="w-[25px] h-[25px] bg-white/40 rounded flex items-center justify-center cursor-pointer"
              onClick={toggleAllCurrentPage}
            >
              {shown.length > 0 &&
                shown.every((r) => checkedRows[r.id]) && (
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
          index={idx}
          editMode={editMode}
          checked={!!checkedRows[row.id]}
          toggleRow={() => toggleRow(row.id)}
          onClickContent={() => openRequest(row)}
          onToggleStatus={(r) => {
            const next = STATUS_NEXT[r.status];
            update(ref(rtdb, `requests/${r.id}`), { status: next });
            setStatusFilter(null);
            showToast(`상태가 '${next}'로 변경되었습니다.`);
          }}
        />
      ))}

      {/* ================= 하단 버튼 ================= */}
      <div className="flex justify-end mt-6 gap-3">
        {!editMode && <Button onClick={() => setEditMode(true)}>수정</Button>}
        {editMode && (
          <>
            <div className="relative w-[90px]">
              <Button onClick={() => setDropdownOpen(!dropdownOpen)}>옵션 ▼</Button>
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
          </>
        )}
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

            showToast("답장이 저장되었습니다.");
            setShowResponse(false);
          }}
        />
      )}

      {/* ================= 토스트 ================= */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2
          bg-black text-white px-5 py-3 rounded-xl text-[16px] opacity-90">
          {toast}
        </div>
      )}
    </div>
  );
}
