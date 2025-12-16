import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";
import { useLocation, useNavigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout.jsx";
import TypeData from "./type_data.jsx";
import QuarterData from "./quarter_data.jsx";
import ProblemsLog from "./problems_log.jsx";
import UnsolvedList from "./unsolved_list.jsx";

import FilterIcon from "../icons/filter_icon.png";

export default function Problems() {
  /* =========================
     알람 유입
  ========================= */
  const location = useLocation();
  const navigate = useNavigate();

  const fromAlarm = location.state?.from === "alarm";
  const alarmProblemId = location.state?.problemId ?? null;

  /* =========================
     상단 탭
  ========================= */
  const [selectedMetric, setSelectedMetric] = useState("전력");

  /* =========================
     problems (문제 로그)
  ========================= */
  const [problems, setProblems] = useState([]);

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

  /* =========================
     타입별 카운트
  ========================= */
  const typeData = useMemo(() => {
    const count = { 전력: 0, 온도: 0, 수도: 0, 가스: 0 };
    problems.forEach((p) => {
      if (count[p.type] !== undefined) {
        count[p.type]++;
      }
    });
    return count;
  }, [problems]);

  /* =========================
     🔥 미해결 항목 (alerts 기준)
     - level: normal 제외
     - status: done 제외
  ========================= */
  const [unsolvedAlerts, setUnsolvedAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUnsolvedAlerts([]);
        return;
      }

      const list = [];

      Object.entries(data).forEach(([floor, dates]) => {
        Object.entries(dates || {}).forEach(([dateKey, alerts]) => {
          Object.entries(alerts || {}).forEach(([id, v]) => {
            if (v.level === "normal") return;
            if (v.status === "done") return;

            list.push({
              id,
              metric: v.metric,
              floor,
              dateKey,
              createdAt: Number(v.createdAt) || 0,
              reason: v.reason,
            });
          });
        });
      });

      list.sort((a, b) => b.createdAt - a.createdAt);
      setUnsolvedAlerts(list);
    });
  }, []);

  /* =========================
     분기 데이터 기간
  ========================= */
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  return (
    <div className="w-full h-full">
      <AdminLayout />

      {/* =========================
          메인 + 오른쪽 미해결 래퍼
      ========================= */}
      <div className="relative ml-[330px] mt-10 flex gap-6">
        {/* ===== 왼쪽 메인 ===== */}
        <div className="w-[1150px]">
          {/* 상단 탭 */}
          <div className="grid grid-cols-4 mb-10">
            {["전력", "온도", "수도", "가스"].map((type) => {
              const active = selectedMetric === type;

              return (
                <div key={type} className="flex justify-center">
                  <button
                    onClick={() => setSelectedMetric(type)}
                    className={`
                      w-[170px] h-[65px]
                      flex items-center justify-center gap-2
                      text-[36px] font-bold
                      rounded-[20px]
                      transition
                      ${
                        active
                          ? "bg-white shadow-md text-[#054E76]"
                          : "text-[#999]"
                      }
                    `}
                  >
                    {type}
                    {active && (
                      <img
                        src={FilterIcon}
                        className="w-[35px] h-[35px]"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 차트 영역 */}
          <section className="flex items-start ml-[110px]">
            <div className="w-[420px]">
              <TypeData
                data={typeData}
                selectedMetric={selectedMetric}
              />
            </div>

            <div className="flex flex-col ml-10">
              <QuarterData
                items={problems}
                selectedMetric={selectedMetric}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </section>

          {/* 문제 로그 */}
          <section className="mt-12">
            <ProblemsLog
              problems={problems}
              fromAlarm={fromAlarm}
              alarmProblemId={alarmProblemId}
            />
          </section>
        </div>

        {/* ===== 오른쪽 미해결 ===== */}
        <section className="absolute left-full  top-0">
          <UnsolvedList
            items={unsolvedAlerts}
            onSelectProblem={(id) => {
              navigate("/problems", {
                state: {
                  from: "alarm",
                  problemId: id,
                },
              });
            }}
          />
        </section>

      </div>
    </div>
  );
}
