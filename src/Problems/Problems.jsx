import { useState, useMemo } from "react";
import TypeData from "./type_data.jsx"; 
import AdminLayout from "../layout/AdminLayout.jsx";
import FilterIcon from "../icons/filter_icon.png";
import ProblemsLog from "./problems_log.jsx";

export default function Problems({ alerts = [] }) {
  const [selectedMetric, setSelectedMetric] = useState("전력");

  const processedAlerts = useMemo(() => {
    return alerts.map(a => ({
      ...a,
      status: a.status ?? "unresolved",
    }));
  }, [alerts]);

  const typeData = useMemo(() => {
    const count = { 전력: 0, 수도: 0, 온도: 0, 가스: 0 };
    processedAlerts.forEach(a => {
      if (count[a.type] !== undefined) count[a.type]++;
    });
    return count;
  }, [processedAlerts]);

  const slideX =
    selectedMetric === "전력"
      ? "0%"
      : selectedMetric === "온도"
      ? "100%"
      : selectedMetric === "수도"
      ? "200%"
      : "300%";

  return (
    <div className="w-full h-full p-6">
      <AdminLayout />

      <div className="relative w-full max-w-[950px] mx-auto">
        <div
          className="absolute top-0 h-[65px] bg-white rounded-[20px] shadow-md transition-all duration-300"
          style={{
            width: "calc(100% / 4)",
            transform: `translateX(${slideX})`,
          }}
        />

        <div className="flex relative z-10">
          {["전력", "온도", "수도", "가스"].map((type) => {
            const isActive = selectedMetric === type;

            return (
              <button
                key={type}
                onClick={() => setSelectedMetric(type)}
                className={`
                  flex-1 flex justify-center items-center gap-2
                  text-[36px] font-bold py-2 rounded-[20px]
                  transition-all duration-200 cursor-pointer
                  ${isActive ? "text-[#054E76]" : "text-[#999999]"}
                `}
              >
                {type}

                {isActive && (
                  <img
                    src={FilterIcon}
                    className="w-[28px] h-[28px] ml-2"
                    alt="filter-icon"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 파이차트  */}
      <section className="mr-[163.17px]">
        <TypeData
          data={typeData}
          selectedMetric={selectedMetric}
        />
      </section>

      {/*문제 로그  */}
      <section className="mr-[163.17px]">
        <ProblemsLog problems={processedAlerts} />
      </section>

    </div>
  );
}
