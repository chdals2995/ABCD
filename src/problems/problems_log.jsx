import { useState, useMemo, useRef, useEffect } from "react";
import Report from "./Report.jsx";
import ProblemsDetail from "./problems_detail.jsx";
import PlusIcon from "../icons/plus_icon.png";

const ITEMS_PER_PAGE = 5;

export default function ProblemsLog({
  problems = [],
  fromAlarm = false,
  alarmProblemId = null,
}) {
  /* =========================
     알람 유입 계산 (순수 계산)
  ========================= */
  const alarmIndex = useMemo(() => {
    if (!fromAlarm || !alarmProblemId) return -1;
    return problems.findIndex((p) => p.id === alarmProblemId);
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
  const [selectedProblem, setSelectedProblem] = useState(
    () => initialSelectedProblem
  );
  const [openReport, setOpenReport] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

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
  const pagedProblems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, page]);

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
  }, [fromAlarm, alarmProblemId, page]);

  return (
    <div className="mt-10 border rounded p-5 w-[990px] ml-13">
      {/* 제목 + 필터 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[25px] font-semibold px-1 pt-5">
          원인내역(타입별)
        </h3>

        <div className="flex items-center gap-4 mt-5">
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

          <button
            onClick={() => setOpenReport(true)}
            className="w-8 h-8 rounded-full shadow-md flex items-center justify-center bg-white"
          >
            <img src={PlusIcon} alt="add" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full border-t border-gray-400 mb-4" />

      {/* 테이블 */}
      <table className="w-full border-collapse table-fixed">
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
          {pagedProblems.map((p) => {
            const isTarget =
              fromAlarm && alarmProblemId === p.id;

            return (
              <tr
                key={p.id}
                ref={isTarget ? targetRowRef : null}
                onClick={() => setSelectedProblem(p)}
                className={`border-b text-center cursor-pointer ${
                  isTarget ? "bg-[#E6EEF2]" : ""
                }`}
              >
                <td className="p-4 font-medium">{p.type}</td>
                <td className="p-2">
                  {p.buildingType} {p.floor}
                </td>
                <td className="p-2">{p.content}</td>
                <td className="p-2">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-2">
                  {p.status === "완료" ? "완료" : "미완료"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
  );
}
