// src/componnent/UserMain/NoticeList.jsx
import { useState, useEffect } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

// 날짜 포맷 helper (createdAt 숫자 or 문자열 대응)
function formatDate(value) {
  if (!value) return "";
  // 이미 "2025.01.03" 같은 문자열이면 그대로 사용
  if (typeof value === "string") return value;

  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function NoticeList() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    // ✅ RTDB 경로는 실제 DB 구조에 맞게 "notices" 또는 "notice" 사용
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
        // 🔹 createdAt 기준으로 최신순 정렬
        .sort((a, b) => b.createdAt - a.createdAt);

      setNotices(list);
    });

    // 구독 해제
    return () => unsub();
  }, []);

  return (
    <>
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
              {/* 지금은 클릭 시 아무 동작 X, 나중에 상세/수정 달면 onClick 추가 */}
              <div className="flex items-center">
                {/* 제목: 고정 너비 + 말줄임 */}
                <span className="w-[150px] font-bold truncate mr-4">
                  {notice.title}
                </span>

                {/* 내용 한 줄 요약 */}
                <span className="flex-1 truncate">{notice.content}</span>

                {/* 날짜 라벨 */}
                <span className="w-[100px] ml-4 text-right text-[13px] whitespace-nowrap">
                  {notice.dateLabel}
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
      </div>
    </>
  );
}
