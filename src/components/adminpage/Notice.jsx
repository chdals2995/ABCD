// src/components/adminpage/Notice.jsx
import { useEffect, useState } from "react";
import addIcon from "../../assets/icons/add.png";
import Modal from "../../assets/Modal";
import Button from "../../assets/Button";
import { rtdb, auth } from "../../firebase/config";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import CloseButton from "../../assets/CloseButton";

export default function Notice() {
  const [notices, setNotices] = useState([]);

  // 작성 / 수정 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 현재 작성/수정 폼
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  // 어떤 공지를 수정 중인지 (null이면 새 공지 작성 모드)
  const [editingId, setEditingId] = useState(null);
  const isEditing = editingId !== null;

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

  // 새 공지 작성 버튼 클릭 (+ 버튼)
  const handleCreateClick = () => {
    setEditingId(null); // 새 작성 모드
    setForm({ title: "", content: "" });
    setIsCreateModalOpen(true);
  };

  // 리스트에서 공지 클릭 → 수정 모달 열기
  const handleEditClick = (notice) => {
    setEditingId(notice.id); // 수정할 공지 id 기억
    setForm({
      title: notice.title,
      content: notice.content,
    });
    setIsCreateModalOpen(true);
  };

  // 공지 작성 / 수정 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    try {
      // 1) 수정 모드 + 제목/내용 둘 다 빈 문자열 → 삭제 여부 확인
      if (isEditing && !title && !content) {
        const ok = window.confirm(
          "제목과 내용이 모두 비어 있습니다.\n이 공지를 삭제하시겠습니까?"
        );
        if (!ok) return;

        const targetRef = ref(rtdb, `notices/${editingId}`);
        await remove(targetRef);

        setForm({ title: "", content: "" });
        setEditingId(null);
        setIsCreateModalOpen(false);
        return;
      }

      // 2) 나머지 경우: 둘 중 하나라도 비어 있으면 작성/수정 막기
      if (!title || !content) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      // 3) 정상 작성/수정 처리
      if (isEditing) {
        // 수정 모드
        const targetRef = ref(rtdb, `notices/${editingId}`);
        await update(targetRef, {
          title,
          content,
          updatedAt: Date.now(),
          updatedBy: auth.currentUser?.uid || null,
        });
      } else {
        // 새 공지 작성
        const listRef = ref(rtdb, "notices");
        const newRef = push(listRef);

        await set(newRef, {
          title,
          content,
          createdAt: Date.now(),
          createdBy: auth.currentUser?.uid || null,
        });
      }

      setForm({ title: "", content: "" });
      setEditingId(null);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("공지 저장 중 오류가 발생했습니다.\n" + err.message);
    }
  };

  // 모달 닫기 공통 함수
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingId(null);
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
        flex flex-col           /* 🔹 세로 플렉스로 변경 */
      "
    >
      {/* 제목 */}
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        공지사항
      </h1>

      {/* 공지 리스트 영역 (스크롤) */}
      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[4px] mb-4">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="border-b border-[#000000] text-[16px] pb-[4px]"
            >
              <button
                type="button"
                onClick={() => handleEditClick(notice)}
                className="w-full text-left"
              >
                <div className="flex items-center">
                  {/* 제목: 고정 너비 + 말줄임 */}
                  <span className="w-[150px] font-bold truncate mr-4">
                    {notice.title}
                  </span>

                  {/* 내용 */}
                  <span className="flex-1 truncate">{notice.content}</span>

                  {/* 날짜 */}
                  <span className="w-[100px] ml-4 text-right text-[13px] whitespace-nowrap">
                    {notice.date}
                  </span>
                </div>
              </button>
            </li>
          ))}

          {notices.length === 0 && (
            <li className="text-[14px] text-[#777777] mt-[8px]">
              등록된 공지사항이 없습니다.
            </li>
          )}
        </ul>

        {/* + 버튼 : 스크롤 안, 아래 중앙 + 여백 */}
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={handleCreateClick}
            className="
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
        </div>
      </div>

      {/* 공지사항 작성 / 수정 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        closeOnBackdrop={false} // 바깥 클릭해도 안 닫히도록
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
              {isEditing ? "공지사항 수정" : "공지사항 작성"}
            </h2>
            <CloseButton onClick={handleCloseModal} />
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

          {/* 작성 / 수정 버튼 */}
          <div className="flex justify-center">
            <Button>{isEditing ? "수정" : "작성"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
