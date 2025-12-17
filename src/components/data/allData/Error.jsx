// src/components/allData/Error.jsx
import { useProblems } from "../../../hooks/dataPage/useProblems";

function fmtDate(d) {
  if (!d) return "";
  return String(d).slice(2);
}

export default function Error({ metricKey = "elec", limit = 10, onClickItem }) {
  const { items, loading } = useProblems({ metricKey, limit });

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="w-full h-full bg-white rounded-xl flex flex-col">
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
        <div className="font-pyeojin text-[24px] text-[#000000]">문제 리스트</div>
        <div className="text-xs text-gray-500">
          {loading ? "불러오는 중..." : `최근 ${items.length}건`}
        </div>
      </div>

      {/* ✅ 리스트 영역만 스크롤 */}
      <div className="divide-y overflow-y-auto" style={{ maxHeight: "320px" }}>
        {isEmpty && (
          <>
            <div className="p-4 text-sm text-gray-500">문제 데이터가 없습니다.</div>
            <div className="ml-[50%] mt-[5%] translate-x-[-50%] text-center text-gray-500">
              빈 항목.
            </div>
          </>
        )}

        {!loading &&
          items.map((p) => (
            <button
              key={p.id}
              onClick={() => onClickItem?.(p)}
              className="w-full text-left px-4 py-2 hover:bg-[#054E76]/10 flex items-center justify-between"
            >
              <div className="min-w-0">
                <span className="text-[#000000] text-[16px]">
                  {p.floor ? `${p.floor} ` : ""}
                </span>
                <span className="text-[16px] text-sm text-gray-700 truncate">
                  {p.content ?? ""}
                </span>
              </div>
              <div className="text-xs text-gray-500 shrink-0 ml-3">
                {fmtDate(p.date)}
              </div>
            </button>
          ))}
          <div className="ml-[50%] mt-[5%] translate-x-[-50%] text-center text-gray-500">
              빈 항목.
            </div>
      </div>
    </div>
  );
}
