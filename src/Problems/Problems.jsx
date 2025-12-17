// 문제 내역 페이지 (A단계: 유형 차트만 표시하되 레이아웃 간격 설정)

import { useState, useMemo } from "react";
import TypeData from "./type_data.jsx";

export default function Problems({ alerts = [] }) {

  const [selectedMetric, setSelectedMetric] = useState("전체");

  const processedAlerts = useMemo(() => {
    return alerts.map(a => ({
      ...a,
      status: a.status ?? "unresolved",
    }));
  }, [alerts]);

  const typeData = useMemo(() => {
    const count = { 전력: 0, 수도: 0, 온도: 0, 가스: 0 };
    processedAlerts.forEach(a => {
      if (count[a.metric] !== undefined) count[a.metric]++;
    });
    return count;
  }, [processedAlerts]);

  return (
    <div className="w-full h-full p-6">

      {/* A. 문제 유형 차트 */}
      <div className="mr-[163.17px]">

      <TypeData
        data={typeData}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
        />
      </div>

      {/* B. 분기 데이터 (163px 아래에 배치 예정) */}
      <div className="mr-[163.17px]">
        {/* <QuarterData ... /> */}
      </div>

      {/* C. 미해결 리스트 */}
      <div className="mr-[163.17px]">
        {/* <UnsolvedList ... /> */}
      </div>

      {/* D. 전체 로그 */}
      <div className="mr-[163.17px]">
        {/* <ProblemsLog ... /> */}
      </div>

      {/* E. 상세 모달은 별도 오버레이이므로 여백 불필요 */}
      {/* {selectedProblemId && <ProblemsDetail ... />} */}

    </div>
  );
}
