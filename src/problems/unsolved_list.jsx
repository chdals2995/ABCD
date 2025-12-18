import { useMemo, useState } from "react";

import AlertIcon from "../assets/icons/alert.png"; // ⚠️
import AlarmIcon from "../assets/icons/alarm.png"; // 🔔

const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

/* =========================
   metric 한글 매핑
========================= */
const METRIC_NORMALIZE = {
  elec: "전기",
  electric: "전기",
  power: "전기",
  전력: "전기",
  전기: "전기",

  water: "수도",
  수도: "수도",

  gas: "가스",
  가스: "가스",

  temp: "온도",
  temperature: "온도",
  온도: "온도",
};

function getMetricKorean(metric) {
  return METRIC_NORMALIZE[metric] || metric || "기타";
}

/* =========================
   문장 단위 줄바꿈
========================= */
function wrapText(text) {
  if (!text) return "";

  let s = String(text).trim();
  s = s
    .replace(/돌아와\s+/g, "돌아와\n")
    .replace(/되었습니다\./g, "되었습니다.\n")
    .replace(/됩니다\./g, "됩니다.\n")
    .replace(/감지되었습니다\./g, "감지되었습니다.\n");

  return s.trim();
}

/* =========================
   reason 코드 → 문장
========================= */
function getReasonText(reason, metric, level) {
  if (!reason) return "";

  const looksLikeCode = /^[a-z0-9_]+$/i.test(String(reason));
  if (!looksLikeCode) return String(reason);

  const m = getMetricKorean(metric);

  const map = {
    caution_cleared: `${m} 사용량이 다시 기준 범위로 돌아와 주의 상태가 해제되었습니다.`,
    warning_cleared: `${m} 경고 상태가 해제되었습니다.`,
    recovered_to_normal: `${m} 정상 상태로 복귀했습니다.`,
  };

  if (map[reason]) return map[reason];
  if (level === "warning") return `${m} 정상 범위 초과 상태가 감지되었습니다.`;
  if (level === "caution") return `${m} 이상 상태가 감지되었습니다.`;
  return `${m} 상태 변화가 감지되었습니다.`;
}

export default function UnsolvedList({ items = [], onSelectProblem }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all | request | problem

  /* =========================
     🔎 요청 / 문제 필터
  ========================= */
  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "request")
      return items.filter((i) => i.kind === "request");
    if (filter === "problem")
      return items.filter((i) => i.kind !== "request");
    return items;
  }, [items, filter]);

  const totalPages = useMemo(
    () => Math.ceil(filteredItems.length / PAGE_SIZE),
    [filteredItems.length]
  );

  const safePage = useMemo(() => {
    if (totalPages === 0) return 1;
    if (page < 1) return 1;
    if (page > totalPages) return totalPages;
    return page;
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= PAGE_WINDOW) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(PAGE_WINDOW / 2);
    let start = safePage - half;
    let end = safePage + half;

    if (start < 1) {
      start = 1;
      end = PAGE_WINDOW;
    }
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - PAGE_WINDOW + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="w-[450px] h-[1047px] mr-[40px] mt-6 bg-white border rounded-xl p-6">
      <div className="text-[22px] font-bold text-center mt-5 mb-4">
        미해결 항목
      </div>

      {/* ✅ 요청 / 문제 필터 */}
      <div className="flex justify-center gap-4 text-[16px] mb-6">
        {[
          { key: "all", label: "전체" },
          { key: "request", label: "요청" },
          { key: "problem", label: "문제" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full border ${
              filter === f.key
                ? "bg-[#054E76] text-white border-[#054E76]"
                : "text-gray-500 border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-2 mb-5 border-b border-gray-200" />

      <div className="flex flex-col gap-6">
        {visibleItems.map((item) => {
          const kind = item.kind || "alert";
          const iconSrc = kind === "request" ? AlarmIcon : AlertIcon;

          const reasonKo = getReasonText(item.reason, item.metric, item.level);
          const reasonWrapped = wrapText(reasonKo);

          return (
            <div
              key={item.uid || item.id}
              onClick={() => onSelectProblem?.(item.id)}
              className="cursor-pointer border-b pb-6 hover:bg-gray-50 transition"
            >
              <div className="flex gap-4">
                <div className="w-[32px] shrink-0 flex justify-center">
                  <img
                    src={iconSrc}
                    className="w-[22px] h-[22px] mt-[10px]"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-[20px] font-bold mb-2">
                    {getMetricKorean(item.metric)}
                  </div>

                  <div className="text-[18px] text-gray-600 mb-2">
                    {item.floor} ·{" "}
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </div>

                  <div className="text-[18px] text-gray-800 whitespace-pre-line leading-snug">
                    {reasonWrapped}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-13 flex justify-center items-center gap-2 text-[22px] select-none cursor-pointer">
          <span onClick={goFirst}>&lt;&lt;</span>
          <span onClick={goPrev}>&lt;</span>
          {pageNumbers.map((n) => (
            <span
              key={n}
              onClick={() => setPage(n)}
              className={`px-1 ${
                n === safePage ? "font-bold text-[#054E76]" : "text-gray-400"
              }`}
            >
              {n}
            </span>
          ))}
          <span onClick={goNext}>&gt;</span>
          <span onClick={goLast}>&gt;&gt;</span>
        </div>
      )}
    </div>
  );
}
