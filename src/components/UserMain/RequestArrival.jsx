// src/components/userMain/RequestArrival.jsx
import { useEffect, useMemo, useState } from "react";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { rtdb } from "../../firebase/config";
import { useAuth } from "../Login/contexts/AuthContext";
import Response from "./Response";

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.replaceAll("-", ".");
  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

const TABS = ["전체", "접수", "처리중", "완료"];

export default function RequestArrival() {
  const { user } = useAuth();
  const [tab, setTab] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(ref(rtdb, "requests"), orderByChild("userUid"), equalTo(user.uid));
    const unsub = onValue(q, (snap) => {
      const data = snap.val();
      if (!data) return setItems([]);

      const list = Object.entries(data)
        .map(([id, r]) => ({
          id,
          title: r.title || "",
          content: r.content || "",
          status: r.status || "접수",
          createdAt: r.createdAt || 0,
          date: r.date || "",
          dateLabel: formatDate(r.date || r.createdAt),
          type: r.type || "",
          floor: r.floor || "",
          room: r.room || "",
          reply: r.reply || "",
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setItems(list);
    });

    return () => unsub();
  }, [user]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((it) => {
      const byTab = tab === "전체" ? true : it.status === tab;
      const byKw =
        !kw ||
        it.title.toLowerCase().includes(kw) ||
        it.content.toLowerCase().includes(kw);
      return byTab && byKw;
    });
  }, [items, tab, keyword]);

  const openDetail = (it) => {
    setSelected(it);
    setOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-right text-[14px] font-semibold mb-2">
        {user?.email ? "아이디 님" : "아이디 님"}
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2 mb-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력해주세요."
          className="flex-1 h-[34px] border border-[#B8D0DB] px-2 outline-none"
        />
        <button className="w-[34px] h-[34px] border border-[#B8D0DB]">🔍</button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-[13px] border ${
              tab === t ? "bg-[#054E76] text-white border-[#054E76]" : "bg-white border-[#B8D0DB]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto border border-[#B8D0DB]">
        {filtered.map((it) => (
          <button
            key={it.id}
            onClick={() => openDetail(it)}
            className="w-full flex items-center justify-between px-3 py-2 border-b border-[#E5E7EB] text-left"
          >
            <span className="text-[14px] truncate">{it.title}</span>
            <span className={`text-[13px] ${
              it.status === "완료" ? "text-green-600" : it.status === "처리중" ? "text-orange-500" : "text-blue-600"
            }`}>
              {it.status}
            </span>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="p-4 text-[13px] text-[#777]">표시할 민원이 없습니다.</div>
        )}
      </div>

      {/* 상세/답신 모달 */}
      <Response open={open} onClose={() => setOpen(false)} request={selected} />
    </div>
  );
}
