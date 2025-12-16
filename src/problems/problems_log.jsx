import { useState, useMemo } from "react";
import Report from "./Report.jsx";
import PlusIcon from "../icons/plus_icon.png";


const ITEMS_PER_PAGE = 5;

export default function ProblemsLog({ problems = [] }) {
  const [openReport, setOpenReport] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all | 완료 | 미완료
  const [page, setPage] = useState(1);

  /* =========================
     상태 필터
  ========================= */
  const filteredProblems = useMemo(() => {
    if (statusFilter === "all") return problems;
    return problems.filter((p) => p.status === statusFilter);
  }, [problems, statusFilter]);

  /* =========================
     페이징
  ========================= */
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);

  const pagedProblems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, page]);

  return (
    <div className="mt-10 border rounded p-5 w-[990px] ml-13">
      {/* =========================
          제목 + 버튼 + 필터
      ========================= */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[25px] font-semibold px-1 pt-5">
          원인내역(타입별)
        </h3>

        <div className="flex items-center gap-4 mt-5">
          {/* 상태 필터 */}
          <div className="flex gap-2 text-[16px]">
            <button
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={statusFilter === "all" ? "font-bold" : "text-gray-400"}
            >
              전체
            </button>
            <button
              onClick={() => {
                setStatusFilter("완료");
                setPage(1);
              }}
              className={
                statusFilter === "완료"
                  ? "text-blue-500 font-bold"
                  : "text-gray-400"
              }
            >
              완료
            </button>
            <button
              onClick={() => {
                setStatusFilter("미완료");
                setPage(1);
              }}
              className={
                statusFilter === "미완료"
                  ? "text-red-500 font-bold"
                  : "text-gray-400"
              }
            >
              미완료
            </button>
          </div>

          {/* + 버튼 */}
          <button
            onClick={() => setOpenReport(true)}
            className="w-8 h-8 rounded-full shadow-md flex items-center justify-center bg-white hover:bg-gray-100"
          >
            <img src={PlusIcon} alt="add" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full border-t border-gray-400 mb-4"></div>

      {/* =========================
          테이블
      ========================= */}
      <table className="w-full border-collapse table-fixed ">
        <thead>
          <tr className="border-b text-center">
            <th className="pb-3 w-[110px]">타입</th>
            <th className="pb-3 w-[170px]">위치</th>
            <th className="pb-3">내용</th>
            <th className="pb-3 w-[170px]">발생일시</th>
            <th className="pb-3 w-[90px]">상태</th>
          </tr>
        </thead>

        <tbody>
          {pagedProblems.map((p) => (
            <tr key={p.id} className="border-b text-center">
              <td className="p-4 font-medium">{p.type}</td>

              {/* ⭐ 건물 + 층 */}
              <td className="p-2">
                {p.buildingType} {p.floor}
              </td>

              {/* 내용이 먼저 */}
              <td className="p-2">
                <div className="text-center mx-auto w-full max-w-[420px]">
                  {p.content}
                </div>
              </td>

              {/* 날짜까지만 */}
              <td className="p-2">
                {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
              </td>

              <td className="p-2">
                {p.status === "완료" ? (
                  <span className="text-blue-500">완료</span>
                ) : (
                  <span className="text-red-500">미완료</span>
                )}
              </td>
            </tr>
          ))}

          {pagedProblems.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-400">
                표시할 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* =========================
          페이징
      ========================= */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6 text-[16px]">
          <button disabled={page === 1} onClick={() => setPage(1)}>
            {"<<"}
          </button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              onClick={() => setPage(pNum)}
              className={page === pNum ? "font-bold" : "text-gray-400"}
            >
              {pNum}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            {">"}
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {">>"}
          </button>
        </div>
      )}

      {/* =========================
          문제 입력 모달
      ========================= */}
      {openReport && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={() => setOpenReport(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Report onClose={() => setOpenReport(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
