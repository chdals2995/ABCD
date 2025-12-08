// src/components/adminpage/Todo.jsx
import { useEffect, useState } from "react";
import { rtdb, auth } from "../../firebase/config";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import addIcon from "../../assets/icons/add.png";
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import CloseButton from "../../assets/CloseButton";

// YYYY.MM.DD 형식
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

// 시작/종료 날짜 라벨
function buildPeriodLabel(startAt, endAt) {
  if (!startAt && !endAt) return "";
  const startStr = startAt ? formatDate(startAt) : "-";
  const endStr = endAt ? formatDate(endAt) : "-";
  return `시작 ${startStr} · 종료 ${endStr}`;
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

  // 작성 / 수정 모달
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 현재 작성/수정 폼
  const [form, setForm] = useState({
    target: "", // 점검 대상
    description: "", // 점검 유형/내용
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  // 어떤 항목 수정 중인지 (null이면 새 작성)
  const [editingId, setEditingId] = useState(null);
  const isEditing = editingId !== null;

  // 점검 목록 실시간 구독 (todos)
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
        // 일정 시작일(없으면 createdAt) 기준 최신 순
        .sort((a, b) => {
          const aKey = a.startAt || a.createdAt || 0;
          const bKey = b.startAt || b.createdAt || 0;
          return bKey - aKey;
        });

      setItems(list);
    });

    return () => unsub();
  }, []);

  // 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 새 점검 항목 추가 버튼 (+)
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

  // 리스트에서 항목 클릭 → 수정 모달
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

  // 작성 / 수정 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const target = form.target.trim();
    const description = form.description.trim();

    const startAt = combineDateTime(form.startDate, form.startTime);
    const endAt = combineDateTime(form.endDate, form.endTime);

    try {
      // 필수값 체크
      if (!target) {
        alert("점검 대상을 입력해주세요.");
        return;
      }
      if (!description) {
        alert("점검 유형/내용을 입력해주세요.");
        return;
      }
      if (!form.startDate || !form.endDate) {
        alert("점검 일정을 입력해주세요.");
        return;
      }
      if (startAt && endAt && startAt > endAt) {
        alert("시작 시간이 종료 시간보다 늦을 수 없습니다.");
        return;
      }

      if (isEditing) {
        // 수정
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
        // 새 항목
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

  // 삭제 버튼
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
      {/* 제목 */}
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        점검 목록
      </h1>

      {/* 리스트 + 스크롤 영역 */}
      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[6px] mb-4">
          {items.map((item) => (
            <li key={item.id} className="border-b border-[#000000] pb-[6px]">
              {/* 한 카드 전체 클릭 → 수정 */}
              <button
                type="button"
                onClick={() => handleEditClick(item)}
                className="w-full text-left"
              >
                <div className="flex flex-col gap-[2px] py-[2px]">
                  {/* 1줄차: 점검 대상 + 시작/종료일 */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate max-w-[60%]">
                      {item.target}
                    </span>
                    <span className="text-[12px] text-gray-600 whitespace-nowrap">
                      {item.periodLabel}
                    </span>
                  </div>

                  {/* 2줄차: 점검 내용 */}
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

      {/* 작성 / 수정 모달 (점검 등록) */}
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
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-6" />
            <h2 className="flex-1 text-center text-[35px] font-pyeojin">
              {isEditing ? "점검 수정" : "점검 등록"}
            </h2>
            <CloseButton onClick={handleCloseModal} />
          </div>

          {/* 점검 대상 */}
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

          {/* 점검 유형/내용 */}
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
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                text-[18px]
              "
            />
          </div>

          {/* 점검 일정 */}
          <div className="mb-6">
            <label className="block mb-1 text-[20px]">점검 일정</label>

            <div className="flex items-center gap-2">
              <div className="flex">
                {/* 시작 날짜 */}
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="
        w-[115px]            /* ✔ 폭 줄이기 */
        h-[32px]
        bg-white px-2
        shadow-[0_2px_3px_rgba(0,0,0,0.25)]
        outline-none
        text-[13px]          /* ✔ 글씨도 살짝 줄이기 */
      "
                />

                {/* 시작 시간 */}
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="
        w-[110px]            /* ✔ 시간 input은 더 조금 */
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
                {/* 종료 날짜 */}
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

                {/* 종료 시간 */}
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

          {/* 작성 / 수정 / 삭제 버튼 */}
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
