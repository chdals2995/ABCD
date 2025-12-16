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
  get,
} from "firebase/database";
import { rtdb } from "../../firebase/config";
import { useAuth } from "../Login/contexts/AuthContext";
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import CloseButton from "../../assets/CloseButton";
import addIcon from "../../assets/icons/add.png";

// 날짜 포맷 helper
function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.includes("-") ? value.replaceAll("-", ".") : value;

  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

const INITIAL_FORM = {
  title: "",
  date: "",
  floor: "",
  room: "",
  type: "",
  content: "",
};

// ✅ users/{authUid}에서 userId 가져오기 (파란색 userId)
async function fetchUserIdByUid(uid) {
  if (!uid) return "";
  try {
    const snap = await get(ref(rtdb, `users/${uid}`));
    const u = snap.val();
    return u?.userId || u?.userid || u?.loginId || "";
  } catch (e) {
    console.error("[UserRequest] fetchUserIdByUid 실패:", e);
    return "";
  }
}

export default function UserRequest() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  // ✅ 내 userId(예: parkseong123 / abdc4)
  const [myUserId, setMyUserId] = useState("");

  // ✅ 로그인 유저의 userId 로드
  useEffect(() => {
    if (!user?.uid) return;

    (async () => {
      const id = await fetchUserIdByUid(user.uid);
      setMyUserId(id);
    })();
  }, [user?.uid]);

  // ✅ 내 민원만 구독 (userUid로 필터링)
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(ref(rtdb, "requests"), orderByChild("userUid"), equalTo(user.uid));

    const unsub = onValue(q, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setRequests([]);
        return;
      }

      const list = Object.entries(data)
        .map(([id, r]) => ({
          id,
          userUid: r.userUid || null,
          userId: r.userId || "",
          title: r.title || "",
          content: r.content || "",
          status: r.status || "접수",
          date: r.date || "",
          floor: r.floor || "",
          room: r.room || "",
          type: r.type || "",
          createdAt: r.createdAt || 0,
          dateLabel: formatDate(r.date || r.createdAt),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setRequests(list);
    });

    return () => unsub();
  }, [user?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  // ✅ 민원 등록 (user_id 저장 ❌ 제거)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.uid) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content || !form.date || !form.floor || !form.room || !form.type) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // ✅ userId가 비어있으면 한번 더 로드
    let uidText = myUserId;
    if (!uidText) {
      uidText = await fetchUserIdByUid(user.uid);
      setMyUserId(uidText);
    }

    if (!uidText) {
      alert("계정 userId를 불러오지 못했습니다. (users/{uid}/userId 확인)");
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
        status: "접수",
        createdAt: Date.now(),

        // ✅ 최종 저장 필드
        userUid: user.uid,           // auth uid
        userId: uidText,             // users/{uid}/userId
        userEmail: user.email || null,

        // ❌ user_id: 저장하지 않음
      });

      setForm(INITIAL_FORM);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("민원 등록 중 오류가 발생했습니다.\n" + err.message);
    }
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
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        나의 민원 요청
      </h1>

      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[4px] mb-4">
          {requests.map((req) => (
            <li key={req.id} className="border-b border-[#000000] text-[16px] pb-[4px]">
              <div className="flex items-center gap-2">
                <span className="w-[90px] text-[13px] truncate">
                  {req.floor && req.room ? `${req.floor}층 ${req.room}호` : ""}
                </span>

                <span className="w-[70px] text-[13px] text-center truncate">
                  {req.type}
                </span>

                <span className="w-[150px] font-bold truncate mr-2">
                  {req.title}
                </span>

                <span className="flex-1 truncate">{req.content}</span>

                <span className="w-[70px] text-center text-[13px] ml-2">
                  {req.status}
                </span>

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

        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={handleOpenModal}
            className="w-[30px] h-[30px] flex items-center justify-center"
          >
            <img src={addIcon} alt="민원 요청 등록 버튼" className="w-[30px] h-[30px]" />
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} closeOnBackdrop={false}>
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
              민원 요청 작성
            </h2>
            <CloseButton onClick={handleCloseModal} />
          </div>

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

          <div className="mb-6">
            <label className="block mb-1 text-[20px]">내용</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="내용을 입력 하세요"
              className="
                w-full
                h-[120px]
                bg-white
                px-3 py-2
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                resize-none
                text-[16px]
                overflow-y-auto
              "
            />
          </div>

          <div className="flex justify-center">
            <Button>등록</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
