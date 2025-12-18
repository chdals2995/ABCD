// src/problems/problems_log.jsx
import { useState, useMemo, useRef, useEffect } from "react";

// ✅ 여기 중요: 파일명/대소문자 실제랑 맞춰야 함
import Report from "./Report.jsx";
import ProblemsDetail from "./problems_detail.jsx";

import PlusIcon from "../icons/plus_icon.png";

// ✅ 토스트는 부모(ProblemsLog)에 두면 모달 닫혀도 유지됨
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ITEMS_PER_PAGE = 5;

/* =========================
   status 정규화
========================= */
function normalizeStatus(status) {
  if (!status) return "미완료";
  if (status === "완료") return "완료";
  if (status === "미완료") return "미완료";
  if (status === "resolved" || status === "done" || status === true) return "완료";
  if (status === "unresolved" || status === "pending" || status === false) return "미완료";
  return status;
}

/* =========================
   id 정규화
========================= */
function getProblemId(p, fallbackIndex) {
  return p?.id ?? p?.problemId ?? p?.alertId ?? p?.key ?? `row-${fallbackIndex}`;
}

export default function ProblemsLog({
  problems = [],
  fromAlarm = false,
  alarmProblemId = null,
}) {
  /* =========================
     알람 유입 계산
  ========================= */
  const alarmIndex = useMemo(() => {
    if (!fromAlarm || !alarmProblemId) return -1;
    return problems.findIndex((p, idx) => getProblemId(p, idx) === alarmProblemId);
  }, [fromAlarm, alarmProblemId, problems]);

  const initialPage = useMemo(() => {
    if (alarmIndex === -1) return 1;
    return Math.floor(alarmIndex / ITEMS_PER_PAGE) + 1;
  }, [alarmIndex]);

  const initialSelectedProblem = useMemo(() => {
    if (alarmIndex === -1) return null;
    return problems[alarmIndex];
  }, [alarmIndex, problems]);

  /* =========================
     state
  ========================= */
  const [page, setPage] = useState(() => initialPage);
  const [selectedProblem, setSelectedProblem] = useState(() => initialSelectedProblem);
  const [openReport, setOpenReport] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  /* =========================
     알람 유입 보정
  ========================= */
  useEffect(() => {
    if (!fromAlarm) return;
    if (alarmIndex === -1) return;

    queueMicrotask(() => {
      setPage(initialPage);
      setSelectedProblem(initialSelectedProblem);
    });
  }, [fromAlarm, alarmIndex, initialPage, initialSelectedProblem]);

  /* =========================
     상태 필터
  ========================= */
  const filteredProblems = useMemo(() => {
    if (statusFilter === "all") return problems;
    return problems.filter((p) => normalizeStatus(p.status) === statusFilter);
  }, [problems, statusFilter]);

  /* =========================
     페이징
  ========================= */
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

  /* =========================
     자동 스크롤
  ========================= */
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
        autoClose={500}
        hideProgressBar={false}
        closeOnClick
        style={{ zIndex: 999999 }}
      />

      <div className="mt-10 border rounded p-5 w-[1020px] ml-15">
        {/* 제목 + 필터 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[25px] font-semibold px-1 pt-5">원인내역(타입별)</h3>

          <div className="flex items-center gap-4 mt-5">
            <div className="flex gap-2 text-[20px]">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setPage(1);
                }}
                className={`${statusFilter === "all" ? "font-bold" : "text-gray-400"} cursor-pointer`}
              >
                전체
              </button>

              <button
                onClick={() => {
                  setStatusFilter("완료");
                  setPage(1);
                }}
                className={`${statusFilter === "완료" ? "text-[#0E5F90] font-bold" : "text-gray-400"} cursor-pointer`}
              >
                완료
              </button>

              <button
                onClick={() => {
                  setStatusFilter("미완료");
                  setPage(1);
                }}
                className={`${statusFilter === "미완료" ? "text-[#CA3535] font-bold" : "text-gray-400"} cursor-pointer`}
              >
                미완료
              </button>
            </div>

            <button
              onClick={() => setOpenReport(true)}
              className="w-8 h-8 rounded-full shadow-md flex items-center justify-center bg-white cursor-pointer"
            >
              <img src={PlusIcon} alt="add" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full border-t border-gray-400 mb-4" />

        {/* 테이블 */}
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="border-b text-center text-[17px]">
              <th className="pb-3 w-[110px]">타입</th>
              <th className="pb-3 w-[170px]">위치</th>
              <th className="pb-3">내용</th>
              <th className="pb-3 w-[170px]">발생일시</th>
              <th className="pb-3 w-[90px]">상태</th>
            </tr>
          </thead>

          <tbody>
            {pagedProblems.map((p, idx) => {
              const pid = getProblemId(p, idx);
              const isTarget = fromAlarm && alarmProblemId === pid;
              const normalized = normalizeStatus(p.status);
              const isDone = normalized === "완료";

              // ✅ 핵심 수정: 입력한 날짜 우선
              const displayDate = p.problemDate
                ? new Date(p.problemDate).toLocaleDateString()
                : p.createdAt
                ? new Date(p.createdAt).toLocaleDateString()
                : "-";

              return (
                <tr
                  key={pid}
                  ref={isTarget ? targetRowRef : null}
                  onClick={() => setSelectedProblem(p)}
                  className={`border-b text-center cursor-pointer text-[20px] ${isTarget ? "bg-[#E6EEF2]" : ""}`}
                >
                  <td className="p-4 font-medium text-[20px]">{p.type}</td>
                  <td className="p-2 text-[20px]">
                    {p.buildingType} {p.floor}
                  </td>
                  <td className="p-2 text-[20px] ">{p.content}</td>
                  <td className="p-2 text-[20px]">{displayDate}</td>
                  <td className={`p-2 font-semibold text-[20px] ${isDone ? "text-[#0E5F90]" : "text-[#CA3535]"}`}>
                    {isDone ? "완료" : "미완료"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 페이징 */}
        <div className="flex justify-center items-center gap-3 mt-5 text-[20px] select-none">
          <span
            className={`${currentPage === 1 ? "text-gray-300 cursor-default" : "text-gray-500 cursor-pointer"}`}
            onClick={() => currentPage !== 1 && setPage(1)}
          >
            {"<<"}
          </span>

          <span
            className={`${currentPage === 1 ? "text-gray-300 cursor-default" : "text-gray-500 cursor-pointer"}`}
            onClick={() => currentPage !== 1 && setPage((prev) => Math.max(1, prev - 1))}
          >
            {"<"}
          </span>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              onClick={() => setPage(n)}
              className={`cursor-pointer ${n === currentPage ? "text-[#0E5F90] font-semibold" : "text-gray-500"}`}
            >
              {n}
            </span>
          ))}

          <span
            className={`${currentPage === totalPages ? "text-gray-300 cursor-default" : "text-gray-500 cursor-pointer"}`}
            onClick={() => currentPage !== totalPages && setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {">"}
          </span>

          <span
            className={`${currentPage === totalPages ? "text-gray-300 cursor-default" : "text-gray-500 cursor-pointer"}`}
            onClick={() => currentPage !== totalPages && setPage(totalPages)}
          >
            {">>"}
          </span>
        </div>

        {/* 문제 상세 */}
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
