// src/problems/problems_log.jsx
import { useState, useMemo, useRef, useEffect } from "react";

import Report from "./Report.jsx";
import ProblemsDetail from "./problems_detail.jsx";

import PlusIcon from "../icons/plus_icon.png";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 4;

/* =========================
   status 정규화
========================= */
function normalizeStatus(status) {
  if (!status) return "미완료";
  if (status === "완료") return "완료";
  if (status === "미완료") return "미완료";
  if (status === "resolved" || status === "done" || status === true)
    return "완료";
  if (status === "unresolved" || status === "pending" || status === false)
    return "미완료";
  return status;
}

function getProblemId(p, fallbackIndex) {
  return (
    p?.id ?? p?.problemId ?? p?.alertId ?? p?.key ?? `row-${fallbackIndex}`
  );
}

export default function ProblemsLog({
  problems = [],
  fromAlarm = false,
  alarmProblemId = null,
}) {
  const alarmIndex = useMemo(() => {
    if (!fromAlarm || !alarmProblemId) return -1;
    return problems.findIndex(
      (p, idx) => getProblemId(p, idx) === alarmProblemId
    );
  }, [fromAlarm, alarmProblemId, problems]);

  const initialPage = useMemo(() => {
    if (alarmIndex === -1) return 1;
    return Math.floor(alarmIndex / ITEMS_PER_PAGE) + 1;
  }, [alarmIndex]);

  const initialSelectedProblem = useMemo(() => {
    if (alarmIndex === -1) return null;
    return problems[alarmIndex];
  }, [alarmIndex, problems]);

  const [page, setPage] = useState(() => initialPage);
  const [selectedProblem, setSelectedProblem] = useState(
    () => initialSelectedProblem
  );
  const [openReport, setOpenReport] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!fromAlarm) return;
    if (alarmIndex === -1) return;

    queueMicrotask(() => {
      setPage(initialPage);
      setSelectedProblem(initialSelectedProblem);
    });
  }, [fromAlarm, alarmIndex, initialPage, initialSelectedProblem]);

  const filteredProblems = useMemo(() => {
    if (statusFilter === "all") return problems;
    return problems.filter((p) => normalizeStatus(p.status) === statusFilter);
  }, [problems, statusFilter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProblems.length / ITEMS_PER_PAGE));
  }, [filteredProblems.length]);

  const currentPage = useMemo(() => {
    return Math.min(page, totalPages);
  }, [page, totalPages]);

  const pagedProblems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  const targetRowRef = useRef(null);

  useEffect(() => {
    if (!fromAlarm || !alarmProblemId) return;
    if (!targetRowRef.current) return;

    targetRowRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [fromAlarm, alarmProblemId, currentPage]);

  return (
    <>
      <ToastContainer
        newestOnTop
        pauseOnHover={false}
        position="top-center"
        autoClose={700}
        hideProgressBar={false}
        closeOnClick
        style={{ zIndex: 999999 }}
      />

      <div className="border rounded-lg p-4 w-full mb-[10px] bg-white">
        {/* 제목 + 필터 */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[18px] font-semibold">원인내역(타입별)</h3>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-[14px]">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPage(1);
                }}
                className={`${
                  statusFilter === "all" ? "font-bold" : "text-gray-400"
                } cursor-pointer`}
              >
                전체
              </button>

              <button
                onClick={() => {
                  setStatusFilter("완료");
                  setPage(1);
                }}
                className={`${
                  statusFilter === "완료"
                    ? "text-[#0E5F90] font-bold"
                    : "text-gray-400"
                } cursor-pointer`}
              >
                완료
              </button>

              <button
                onClick={() => {
                  setStatusFilter("미완료");
                  setPage(1);
                }}
                className={`${
                  statusFilter === "미완료"
                    ? "text-[#CA3535] font-bold"
                    : "text-gray-400"
                } cursor-pointer`}
              >
                미완료
              </button>
            </div>

            <button
              onClick={() => setOpenReport(true)}
              className="w-7 h-7 rounded-full shadow-sm flex items-center justify-center bg-white cursor-pointer"
            >
              <img src={PlusIcon} alt="add" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 mb-3" />

        {/* 테이블 */}
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="border-b text-center text-[13px] text-gray-700">
              <th className="pb-2 w-[90px]">타입</th>
              <th className="pb-2 w-[140px]">위치</th>
              <th className="pb-2">내용</th>
              <th className="pb-2 w-[140px]">발생일시</th>
              <th className="pb-2 w-[80px]">상태</th>
            </tr>
          </thead>

          <tbody>
            {pagedProblems.map((p, idx) => {
              const pid = getProblemId(p, idx);
              const isTarget = fromAlarm && alarmProblemId === pid;
              const normalized = normalizeStatus(p.status);
              const isDone = normalized === "완료";

              const displayDate = p.problemDate
                ? new Date(p.problemDate).toLocaleDateString("ko-KR")
                : p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("ko-KR")
                : "-";

              return (
                <tr
                  key={pid}
                  ref={isTarget ? targetRowRef : null}
                  onClick={() => setSelectedProblem(p)}
                  className={`border-b text-center cursor-pointer text-[14px] ${
                    isTarget ? "bg-[#E6EEF2]" : ""
                  }`}
                >
                  <td className="py-2 px-2 font-medium">{p.type}</td>
                  <td className="py-2 px-2">
                    {p.buildingType} {p.floor}
                  </td>
                  <td className="py-2 px-2 truncate">{p.content}</td>
                  <td className="py-2 px-2">{displayDate}</td>
                  <td
                    className={`py-2 px-2 font-semibold ${
                      isDone ? "text-[#0E5F90]" : "text-[#CA3535]"
                    }`}
                  >
                    {isDone ? "완료" : "미완료"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-3 text-[14px] select-none">
          <span
            className={`${
              currentPage === 1
                ? "text-gray-300 cursor-default"
                : "text-gray-500 cursor-pointer"
            }`}
            onClick={() => currentPage !== 1 && setPage(1)}
          >
            {"<<"}
          </span>

          <span
            className={`${
              currentPage === 1
                ? "text-gray-300 cursor-default"
                : "text-gray-500 cursor-pointer"
            }`}
            onClick={() =>
              currentPage !== 1 && setPage((prev) => Math.max(1, prev - 1))
            }
          >
            {"<"}
          </span>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              onClick={() => setPage(n)}
              className={`cursor-pointer px-1 ${
                n === currentPage
                  ? "text-[#0E5F90] font-semibold"
                  : "text-gray-500"
              }`}
            >
              {n}
            </span>
          ))}

          <span
            className={`${
              currentPage === totalPages
                ? "text-gray-300 cursor-default"
                : "text-gray-500 cursor-pointer"
            }`}
            onClick={() =>
              currentPage !== totalPages &&
              setPage((prev) => Math.min(totalPages, prev + 1))
            }
          >
            {">"}
          </span>

          <span
            className={`${
              currentPage === totalPages
                ? "text-gray-300 cursor-default"
                : "text-gray-500 cursor-pointer"
            }`}
            onClick={() => currentPage !== totalPages && setPage(totalPages)}
          >
            {">>"}
          </span>
        </div>

        {/* 상세 */}
        {selectedProblem && (
          <ProblemsDetail
            problem={{
              ...selectedProblem,
              source: "alert",
              alertId: selectedProblem.id,
              floor: selectedProblem.floor,
              dateKey: selectedProblem.dateKey,
            }}
            onClose={() => setSelectedProblem(null)}
          />
        )}

        {/* 문제 등록 */}
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
    </>
  );
}
