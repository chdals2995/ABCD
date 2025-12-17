// src/components/adminpage/Todo.jsx
import { useEffect, useState } from "react";
import { rtdb, auth } from "../../firebase/config";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import addIcon from "../../assets/icons/add.png";
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import CloseButton from "../../assets/CloseButton";

// YY.MM.DD 형식 (예: 2025-12-16 → 25.12.16)
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

// 시작/종료 날짜 라벨 → "25.12.16~25.12.24"
function buildPeriodLabel(startAt, endAt) {
  if (!startAt && !endAt) return "";
  const startStr = startAt ? formatDate(startAt) : "-";
  const endStr = endAt ? formatDate(endAt) : "-";
  return `${startStr}~${endStr}`;
}

// timestamp → <input type="date"> 값
function toDateInput(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate() + 0).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// timestamp → <input type="time"> 값 (HH:MM)
function toTimeInput(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// dateStr("YYYY-MM-DD") + timeStr("HH:MM") → timestamp(ms)
function combineDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  let h = 0;
  let min = 0;
  if (timeStr) {
    const [hh, mm] = timeStr.split(":").map(Number);
    if (!Number.isNaN(hh)) h = hh;
    if (!Number.isNaN(mm)) min = mm;
  }
  const dt = new Date(y, m - 1, d, h, min, 0, 0);
  return dt.getTime();
}

export default function Todo() {
  const [items, setItems] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    target: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const [editingId, setEditingId] = useState(null);
  const isEditing = editingId !== null;

  useEffect(() => {
    const todosRef = ref(rtdb, "todos");

    const unsub = onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        return;
      }

      const list = Object.entries(data)
        .map(([id, t]) => {
          const startAt = t.startAt || null;
          const endAt = t.endAt || null;

          return {
            id,
            target: t.target || t.title || "",
            description: t.description || t.content || "",
            createdAt: t.createdAt || 0,
            startAt,
            endAt,
            periodLabel: buildPeriodLabel(startAt, endAt),
          };
        })
        .sort((a, b) => {
          const aKey = a.startAt || a.createdAt || 0;
          const bKey = b.startAt || b.createdAt || 0;
          return bKey - aKey;
        });

      setItems(list);
    });

    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setForm({
      target: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setForm({
      target: item.target,
      description: item.description,
      startDate: toDateInput(item.startAt),
      startTime: toTimeInput(item.startAt),
      endDate: toDateInput(item.endAt),
      endTime: toTimeInput(item.endAt),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const target = form.target.trim();
    const description = form.description.trim();

    const startAt = combineDateTime(form.startDate, form.startTime);
    const endAt = combineDateTime(form.endDate, form.endTime);

    try {
      if (!target) return alert("점검 대상을 입력해주세요.");
      if (!description) return alert("점검 유형/내용을 입력해주세요.");
      if (!form.startDate || !form.endDate)
        return alert("점검 일정을 입력해주세요.");
      if (startAt && endAt && startAt > endAt)
        return alert("시작 시간이 종료 시간보다 늦을 수 없습니다.");

      if (isEditing) {
        const targetRef = ref(rtdb, `todos/${editingId}`);
        await update(targetRef, {
          title: target,
          content: description,
          target,
          description,
          startAt,
          endAt,
          updatedAt: Date.now(),
          updatedBy: auth.currentUser?.uid || null,
        });
      } else {
        const listRef = ref(rtdb, "todos");
        const newRef = push(listRef);

        await set(newRef, {
          title: target,
          content: description,
          target,
          description,
          startAt,
          endAt,
          done: false,
          createdAt: Date.now(),
          createdBy: auth.currentUser?.uid || null,
        });
      }

      setForm({
        target: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("점검 항목 저장 중 오류가 발생했습니다.\n" + err.message);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    const ok = window.confirm("이 점검 항목을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const targetRef = ref(rtdb, `todos/${editingId}`);
      await remove(targetRef);

      setForm({
        target: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("점검 항목 삭제 중 오류가 발생했습니다.\n" + err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // ✅ 나중에 log 페이지 연결용(지금은 자리만)
  const handleMoreClick = () => {
    // TODO: navigate("/log") 같은거 연결 예정
  };

  return (
    <div
      className="
        absolute
        w-[372px] h-[885px] top-[68px] right-0 bg-[#E7F3F8]
        border-[1px] border-[#054E76]
        p-[22px]
        flex flex-col
      "
    >
      {/* ✅ 제목줄: 왼쪽 타이틀 / 오른쪽 더보기... */}
      <div className="flex items-end justify-between border-b border-b-[#666666] pb-2">
        <h1 className="font-bold font-pyeojin text-[25px]">점검 목록</h1>

        <button
          type="button"
          onClick={handleMoreClick}
          className="text-[15px] text-gray-500 hover:underline"
        >
          더보기...
        </button>
      </div>

      {/* 리스트 + 스크롤 영역 */}
      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[6px] mb-4">
          {items.map((item) => (
            <li key={item.id} className="border-b border-[#000000] pb-[6px]">
              <button
                type="button"
                onClick={() => handleEditClick(item)}
                className="w-full text-left"
              >
                <div className="flex flex-col gap-[2px] py-[2px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate max-w-[60%]">
                      {item.target}
                    </span>
                    <span className="text-[12px] text-gray-600 whitespace-nowrap">
                      {item.periodLabel}
                    </span>
                  </div>

                  <div className="text-[14px] text-gray-800 whitespace-normal break-words">
                    {item.description}
                  </div>
                </div>
              </button>
            </li>
          ))}

          {items.length === 0 && (
            <li className="text-[14px] text-[#777777] mt-[8px]">
              등록된 점검 항목이 없습니다.
            </li>
          )}
        </ul>

        {/* + 버튼 */}
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={handleCreateClick}
            className="w-[30px] h-[30px] flex items-center justify-center"
          >
            <img
              src={addIcon}
              alt="점검 항목 추가 버튼"
              className="w-[30px] h-[30px]"
            />
          </button>
        </div>
      </div>

      {/* 작성 / 수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        closeOnBackdrop={false}
      >
        <form
          onSubmit={handleSubmit}
          className="
            w-full h-full
            flex flex-col
            bg-[#E4EDF0]
            px-8 py-6
            text-[14px]
          "
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-6" />
            <h2 className="flex-1 text-center text-[35px] font-pyeojin">
              {isEditing ? "점검 수정" : "점검 등록"}
            </h2>
            <CloseButton onClick={handleCloseModal} />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-[20px]">점검 대상</label>
            <input
              name="target"
              value={form.target}
              onChange={handleChange}
              placeholder="점검할 설비/위치를 입력하세요"
              className="
                w-full h-[39px]
                bg-white
                px-3
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                text-[18px]
              "
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-[20px]">점검 유형/내용</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="점검 유형과 간단한 내용을 입력하세요."
              className="
                w-full h-[39px]
                bg-white
                px-3
                shadow-[0_2px_3px_rgga(0,0,0,0.25)]
                outline-none
                text-[18px]
              "
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-[20px]">점검 일정</label>

            <div className="flex items-center gap-2">
              <div className="flex">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="
                    w-[115px]
                    h-[32px]
                    bg-white px-2
                    shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                    outline-none
                    text-[13px]
                  "
                />

                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="
                    w-[110px]
                    h-[32px]
                    bg-white px-2
                    shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                    outline-none
                    text-[13px]
                  "
                />
              </div>

              <span className="mx-1">~</span>

              <div className="flex">
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="
                    w-[115px]
                    h-[32px]
                    bg-white px-2
                    shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                    outline-none
                    text-[13px]
                  "
                />

                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="
                    w-[110px]
                    h-[32px]
                    bg-white px-2
                    shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                    outline-none
                    text-[13px]
                  "
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-2 gap-4">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 rounded-md border border-red-500 text-red-600 text-[16px]"
              >
                삭제
              </button>
            )}
            <Button>{isEditing ? "수정" : "작성"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
