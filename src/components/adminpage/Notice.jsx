// src/components/adminpage/Notice.jsx
import { useEffect, useState } from "react";
import addIcon from "../../assets/icons/add.png";
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import { rtdb, auth } from "../../firebase/config";
import { ref, onValue, push, set } from "firebase/database";

export default function Notice() {
  const [notices, setNotices] = useState([]);

  // 작성 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  // 날짜 포맷 helper
  const formatDate = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;

    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

  // 공지 실시간 구독
  useEffect(() => {
    const noticesRef = ref(rtdb, "notices");

    const unsub = onValue(noticesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setNotices([]);
        return;
      }

      const list = Object.entries(data)
        .map(([id, n]) => ({
          id,
          title: n.title || "",
          content: n.content || "",
          date: formatDate(n.createdAt || n.date),
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)); // 최신순

      setNotices(list);
    });

    return () => unsub();
  }, []);

  // 작성 폼 change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 공지 작성 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const listRef = ref(rtdb, "notices");
      const newRef = push(listRef);

      await set(newRef, {
        title,
        content,
        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid || null,
      });

      setForm({ title: "", content: "" });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("공지 등록 중 오류가 발생했습니다.\n" + err.message);
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
      "
    >
      {/* 제목 */}
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        공지사항
      </h1>

      {/* 공지 리스트 */}
      <ul className="mt-[14px] space-y-[4px]">
        {notices.map((notice) => (
          <li
            key={notice.id}
            className="border-b border-[#000000] text-[16px] pb-[4px]"
          >
            <div className="flex items-center">
              {/* 제목: 고정 너비 + 말줄임 */}
              <span className="w-[150px] font-bold truncate mr-4">
                {notice.title}
              </span>

              {/* 내용: 항상 같은 지점에서 시작 */}
              <span className="flex-1 truncate">{notice.content}</span>

              {/* 날짜: 오른쪽 정렬, 고정 폭 */}
              <span className="w-[100px] ml-4 text-right text-[13px] whitespace-nowrap">
                {notice.date}
              </span>
            </div>
          </li>
        ))}

        {notices.length === 0 && (
          <li className="text-[14px] text-[#777777] mt-[8px]">
            등록된 공지사항이 없습니다.
          </li>
        )}
      </ul>

      {/* + 버튼 : 아래 중앙 */}
      <button
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
        className="
          relative
          left-1/2 -bottom-[16px]
          -translate-x-1/2
          w-[30px] h-[30px]
          flex items-center justify-center
        "
      >
        <img
          src={addIcon}
          alt="공지사항 등록 버튼"
          className="w-[30px] h-[30px]"
        />
      </button>

      {/* 공지사항 작성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
              공지사항 작성
            </h2>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-6 text-[24px] leading-none"
            >
              ×
            </button>
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
                h-[225px]
                bg-white
                px-3 py-2
                shadow-[0_2px_3px_rgba(0,0,0,0.25)]
                outline-none
                resize-none
                text-[16px]
              "
            />
          </div>

          {/* 작성 버튼 */}
          <div className="flex justify-center">
            <Button>작성</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
