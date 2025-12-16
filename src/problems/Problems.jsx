import { useState, useMemo, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";

import TypeData from "./type_data.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import FilterIcon from "../icons/filter_icon.png";
import ProblemsLog from "./problems_log.jsx";
import QuarterData from "./quarter_data.jsx";
import UnsolvedList from "./unsolved_list.jsx";

export default function Problems({ alerts = [] }) {
  const [selectedMetric, setSelectedMetric] = useState("전력");

  /* =========================
     alerts 가공 (기존 유지)
  ========================= */
  const processedAlerts = useMemo(() => {
    return alerts.map((a) => ({
      ...a,
      status: a.status ?? "unresolved",
    }));
  }, [alerts]);

  /* =========================
     타입별 카운트 (기존 유지)
  ========================= */
  const typeData = useMemo(() => {
    const count = { 전력: 0, 수도: 0, 온도: 0, 가스: 0 };
    processedAlerts.forEach((a) => {
      if (count[a.type] !== undefined) count[a.type]++;
    });
    return count;
  }, [processedAlerts]);

  /* =========================
     기간 (기존 유지)
  ========================= */
  const [startDate] = useState(new Date("2025-01-01"));
  const [endDate] = useState(new Date("2025-12-31"));

  /* =========================
     🔥 problems DB 상태
  ========================= */
  const [problems, setProblems] = useState([]);

  /* =========================
     🔥 problems DB 읽기
     /problems/{전력|수도|온도|가스}
  ========================= */
  useEffect(() => {
    const problemsRef = ref(rtdb, `problems/${selectedMetric}`);

    return onValue(problemsRef, (snapshot) => {
      const val = snapshot.val();

      if (!val) {
        setProblems([]);
        return;
      }

      const list = Object.entries(val).map(([id, data]) => ({
        id,
        ...data,
      }));

      setProblems(list);
    });
  }, [selectedMetric]);

  return (
    <div className="w-full h-full p-6">
      <AdminLayout />

      {/* 🔹 전체 왼쪽 기준 컨테이너 */}
      <div className="relative ml-[330px] w-[1150px] mt-10">
        {/* =========================
            상단 탭
        ========================= */}
        <div className="w-[1150px]">
          <div className="grid grid-cols-4 items-center">
            {["전력", "온도", "수도", "가스"].map((type) => {
              const isActive = selectedMetric === type;

              return (
                <div key={type} className="flex justify-center">
                  <button
                    onClick={() => setSelectedMetric(type)}
                    className={`
                      w-[170px] h-[65px]
                      flex items-center justify-center gap-2
                      text-[36px] font-bold
                      rounded-[20px]
                      transition-all duration-200 cursor-pointer
                      ${isActive ? "bg-white shadow-md text-[#054E76]" : "text-[#999999]"}
                    `}
                  >
                    {type}

                    {isActive && (
                      <img
                        src={FilterIcon}
                        className="w-[35px] h-[35px] ml-2"
                        alt="filter-icon"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <section className="flex items-start mt-10 ml-[110px]">
          {/* 파이차트 */}
          <div className="w-[420px]">
            <TypeData data={typeData} selectedMetric={selectedMetric} />
          </div>

          {/* 쿼터 데이터 */}
          <div className="flex flex-col mr-10">
            <QuarterData
              items={processedAlerts}
              selectedMetric={selectedMetric}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </section>

        {/* =========================
            🔥 문제 로그 (problems)
        ========================= */}
        <section className="mt-12">
          <ProblemsLog problems={problems} />
        </section>
      </div>

      {/* 미해결 리스트 */}
      <section className="absolute right-0 top-[120px]">
        <UnsolvedList />
      </section>
    </div>
  );
}
