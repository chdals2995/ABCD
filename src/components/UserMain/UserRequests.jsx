// src/components/UserMain/UserRequest.jsx

import { useEffect, useState } from "react";
import {
  ref,
  onValue,
  push,
  set,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { rtdb } from "../../firebase/config";
import { useAuth } from "../Login/contexts/AuthContext"; // 경로는 프로젝트 구조에 맞게!
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import CloseButton from "../../assets/CloseButton";
import addIcon from "../../assets/icons/add.png";

// 날짜 포맷 helper
function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

// ✅ 폼 초기값을 하나로 정의해두면 reset할 때 편함
const INITIAL_FORM = {
  title: "",
  date: "",
  floor: "",
  room: "",
  type: "",
  content: "",
};

export default function UserRequest() {
  const { user } = useAuth(); // ✅ 현재 로그인 유저
  const [requests, setRequests] = useState([]); // 내 민원 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // 작성 모달
  const [form, setForm] = useState(INITIAL_FORM);

  // 🔹 내 민원만 구독
  useEffect(() => {
    if (!user) return; // 아직 로그인 정보 없으면 아무것도 안 함

    // /requests 중 userUid == 현재 user.uid 인 것만
    const q = query(
      ref(rtdb, "requests"),
      orderByChild("userUid"),
      equalTo(user.uid)
    );

    const unsub = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRequests([]);
        return;
      }

      const list = Object.entries(data)
        .map(([id, r]) => ({
          id,
          title: r.title || "",
          content: r.content || "",
          status: r.status || "접수",
          // 🔽 추가 필드들
          date: r.date || "",
          floor: r.floor || "",
          room: r.room || "",
          type: r.type || "",
          createdAt: r.createdAt || 0,
          // 사용자가 입력한 date가 있으면 그걸 우선 표시, 없으면 createdAt 사용
          dateLabel: formatDate(r.date || r.createdAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt); // 최신순

      setRequests(list);
    });

    return () => unsub();
  }, [user]);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 민원 작성 버튼 클릭 → 모달 열기
  const handleOpenModal = () => {
    setForm(INITIAL_FORM); // ✅ 모든 필드 초기화
    setIsModalOpen(true);
  };

  // 민원 작성 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();

    // ✅ 새로 추가한 항목들도 필수로 체크
    if (!title || !content || !form.date || !form.floor || !form.room || !form.type) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const listRef = ref(rtdb, "requests");
      const newRef = push(listRef);

      await set(newRef, {
        title,
        date: form.date,
        floor: form.floor,
        room: form.room,
        type: form.type,
        content,
        status: "접수", // 기본 상태
        userUid: user.uid,
        userEmail: user.email || null,
        createdAt: Date.now(),
      });

      setForm(INITIAL_FORM); // ✅ 성공 후 초기화
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("민원 등록 중 오류가 발생했습니다.\n" + err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className="
        relative
        w-[665px] h-[302px]
        border-[12px] border-[#054E76]
        rounded-[10px]
        bg-white
        px-[22px] pt-[18px]
        flex flex-col
        mt-6
      "
    >
      {/* 제목 */}
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        나의 민원 요청
      </h1>

      {/* 내 민원 리스트 */}
      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[4px] mb-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="border-b border-[#000000] text-[16px] pb-[4px]"
            >
              <div className="flex items-center gap-2">
                {/* 층/호실 */}
                <span className="w-[90px] text-[13px] truncate">
                  {req.floor && req.room
                    ? `${req.floor}층 ${req.room}호`
                    : ""}
                </span>

                {/* 유형 */}
                <span className="w-[70px] text-[13px] text-center truncate">
                  {req.type}
                </span>

                {/* 제목 */}
                <span className="w-[150px] font-bold truncate mr-2">
                  {req.title}
                </span>

                {/* 내용 요약 */}
                <span className="flex-1 truncate">{req.content}</span>

                {/* 상태 */}
                <span className="w-[70px] text-center text-[13px] ml-2">
                  {req.status}
                </span>

                {/* 날짜 */}
                <span className="w-[90px] ml-2 text-right text-[13px] whitespace-nowrap">
                  {req.dateLabel}
                </span>
              </div>
            </li>
          ))}

          {requests.length === 0 && (
            <li className="text-[14px] text-[#777777] mt-[8px]">
              등록된 민원 요청이 없습니다.
            </li>
          )}
        </ul>

        {/* + 버튼 (민원 작성) */}
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-[30px] h-[30px] flex items-center justify-center"
          >
            <img
              src={addIcon}
              alt="민원 요청 등록 버튼"
              className="w-[30px] h-[30px]"
            />
          </button>
        </div>
      </div>

      {/* 민원 작성 모달 */}
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
              민원 요청 작성
            </h2>
            <CloseButton onClick={handleCloseModal} />
          </div>

          {/* 날짜 */}
          <div className="mb-3">
            <label className="block mb-1 text-[18px]">요청 일자</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="
                w-full h-[36px]
                bg-white
                px-3
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                text-[16px]
              "
            />
          </div>

          {/* 층 / 호실 */}
          <div className="mb-3 flex gap-3">
            <div className="flex-1">
              <label className="block mb-1 text-[18px]">층</label>
              <input
                name="floor"
                value={form.floor}
                onChange={handleChange}
                placeholder="예: 10"
                className="
                  w-full h-[36px]
                  bg-white
                  px-3
                  shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                  outline-none
                  text-[16px]
                "
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-[18px]">호실</label>
              <input
                name="room"
                value={form.room}
                onChange={handleChange}
                placeholder="예: 1003"
                className="
                  w-full h-[36px]
                  bg-white
                  px-3
                  shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                  outline-none
                  text-[16px]
                "
              />
            </div>
          </div>

          {/* 유형 */}
          <div className="mb-4">
            <label className="block mb-1 text-[18px]">민원 유형</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="
                w-full h-[36px]
                bg-white
                px-3
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                text-[16px]
              "
            >
              <option value="">선택하세요</option>
              <option value="전기">전기</option>
              <option value="수도">수도</option>
              <option value="가스">가스</option>
              <option value="냉난방">냉난방</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 제목 */}
          <div className="mb-4">
            <label className="block mb-1 text-[20px]">제목</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="제목을 입력 하세요"
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

          {/* 내용 */}
          <div className="mb-6">
            <label className="block mb-1 text-[20px]">내용</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="내용을 입력 하세요"
              className="
                w-full
                h-[160px]
                bg-white
                px-3 py-2
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                resize-none
                text-[16px]
              "
            />
          </div>

          {/* 등록 버튼 */}
          <div className="flex justify-center">
            <Button>등록</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
