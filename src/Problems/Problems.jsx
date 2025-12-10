import { useState, useMemo } from "react";
import TypeData from "./type_data.jsx"; // TypeData 컴포넌트 그대로 사용
import AdminLayout from "../layout/AdminLayout.jsx";
import FilterIcon from "../icons/filter_icon.png";


export default function Problems({ alerts = [] }) {
  const [selectedMetric, setSelectedMetric] = useState("전력");

  // 알림 데이터 처리
  const processedAlerts = useMemo(() => {
    return alerts.map(a => ({
      ...a,
      status: a.status ?? "unresolved",
    }));
  }, [alerts]);

  // 문제 유형별 데이터 계산 (전력, 수도, 온도, 가스)
  const typeData = useMemo(() => {
    const count = { 전력: 0, 수도: 0, 온도: 0, 가스: 0 };
    processedAlerts.forEach(a => {
      if (count[a.metric] !== undefined) count[a.metric]++;
    });
    return count;
  }, [processedAlerts]);

  // 상단 필터 탭 (슬라이드 하이라이트 포함)
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
      {/* Admin Layout (상단바 등) */}
      <AdminLayout />

      {/* =======================
          A. 상단 필터 탭 + 슬라이드 하이라이트
      ========================*/}
      <div className="relative w-full max-w-[950px] mx-auto">
        {/* 배경 하이라이트 */}
        <div
          className="absolute top-0 h-[65px] bg-white rounded-[20px] shadow-md transition-all duration-300"
          style={{
            width: "calc(100% / 4)",
            transform: `translateX(${slideX})`,
          }}
        />

        {/* 상단 버튼 4개 */}
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
                {/* 활성화된 탭에서만 아이콘 표시 */}
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

      {/* =======================
          A. 문제 유형 차트
      ========================*/}
      <section className="mr-[163.17px]">
        <TypeData
          data={typeData}
          selectedMetric={selectedMetric} // 필터 탭에서 선택한 값 전달
        />
      </section>
    </div>
  );
}
