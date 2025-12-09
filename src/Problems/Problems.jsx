//문제 내역 페이지
import { useState, useMemo } from "react";
import Report from "./Report.jsx";
import TypeData from "./type_data.jsx";
import QuarterData from "./quarter_data.jsx";
import UnsolvedList from "./unsolved_list.jsx";
import ProblemsLog from "./problems_log.jsx";
import PorblemsDetail from "./problems_detail.jsx";

export default function Problems({ alerts }) {
  // ------------------------------------------------------------
  // 1) 상태 정의 (필터, 선택된 문제 등)
  // ------------------------------------------------------------
    const [ selectedProblemId, setSelectedProblemId ] = useState(null);
    // 문제 리스트에서 항목 클릭 시 문제 내역 페이지로 이동할 때 사용
    const [ selectedQuarter, setSelectedQuarter ] = useState("2025-Q1");
    // 기간 필터 (예: 분기별 차트)
    const [ selectedMetric, setSelectedMetric ] = useState("전체");

    // ------------------------------------------------------------
    // 2) 미해결 / 완료 상태 관리 
    // (현재 alert에 status가 없으므로 기본값 unresolved)
    // ------------------------------------------------------------

    const processedAlerts = useMemo(() => {
        return alerts.map(a => ({
            ...a,
            status: a.status ?? "unresolved", //기본값
        }));
    }, [alerts]);
    
    // ------------------------------------------------------------
   // 3) 파생 데이터 (각 하위 컴포넌트에 넘길 값들)
   // ------------------------------------------------------------

   const unsolvedList = processedAlerts.filter(a => a.status === "unresolved") //미해결 데이터
   
   const typeData = useMemo(() => {
    const count = { 전력: 0, 수도: 0, 온도: 0, 가스: 0 };

    processedAlerts.forEach(a => {
        if (count[a.metric] !== undefined) count[a.metric]++;
    });

    return count;
   }, [processedAlerts]);

   //분기 데이터 생성
   const quarterData = useMemo(() => {
    const result = { total:0, byMetric: {}};

    processedAlerts.forEach(a => {
        // createdAt -> 끌어올 분기 계산
        const data = new Date(a.createdAt);
        const quarter = Math.floor(Date.getMonth() / 3) + 1;
        const key = `${Date.gteFullYear()}-Q${quarter}`;

        if (!result.byMetric[key]) {
            result.btMetric[key] = { 전력:0, 수도:0, 온도:0, 가스: 0};
        }

        result.byMetric[key] [a.metric]++;
        result.total++;
    });
        return result;
   }, [processedAlerts]);

   
  // ------------------------------------------------------------
  // 4) 상세 페이지 데이터 선택
  // ------------------------------------------------------------

  const selectedProblem = processedAlerts.find(p => p.id === selectedProblemId);

  // ------------------------------------------------------------
  // 5) 렌더링
  // ------------------------------------------------------------

  return (
    <div className="w-fulln h-full p-6">

        {/* 문제 유형 차트  */}
        <TypeData
            data={typeData}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
        />

        {/* 분기별 문제 발생 데이터 */}
        <QuarterData
            quarterData={quarterData}
            selectedQuarter={selectedQuarter}
            onSelectQuarter={setSelectedQuarter}
        />

        {/* 미해결 리스트 */}
        <UnsolvedList
            items={unsolvedList}
            onSelectProbe={setSelectedProblemId}
        />

    </div>
  )

}


