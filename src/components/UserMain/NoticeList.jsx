// src/components/userMain/NoticeList.jsx
import { useState, useEffect } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";
import NoticeDetail from "./NoticeDetail";

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function NoticeList() {
  const [notices, setNotices] = useState([]);

  // ✅ 추가: 모달 상태
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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
          createdAt: n.createdAt || 0,
          dateLabel: formatDate(n.createdAt || n.date),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setNotices(list);
    });

    return () => unsub();
  }, []);

  const openModal = (notice) => {
    setSelected(notice);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <h1 className="font-bold font-pyeojin text-[25px] border-b border-b-[#666666]">
        공지사항
      </h1>

      <div className="mt-[14px] flex-1 overflow-y-auto pr-1 pb-4">
        <ul className="space-y-[4px] mb-4">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="border-b border-[#000000] text-[16px] pb-[4px]"
            >
              {/* ✅ 클릭하면 모달 */}
              <button
                type="button"
                onClick={() => openModal(notice)}
                className="w-full text-left"
              >
                <div className="flex items-center">
                  <span className="w-[150px] font-bold truncate mr-4">
                    {notice.title}
                  </span>
                  <span className="flex-1 truncate">{notice.content}</span>
                  <span className="w-[100px] ml-4 text-right text-[13px] whitespace-nowrap">
                    {notice.dateLabel}
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
      </div>

      {/* ✅ 모달 */}
      <NoticeDetail isOpen={open} onClose={closeModal} notice={selected} />
    </div>
  );
}
