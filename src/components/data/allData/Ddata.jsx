// src/components/data/allData/Ddata.jsx
import AggBarChart from "../common/AggBarChart";
import { useAggSeries } from "../../../hooks/dataPage/useAggSeries";

export default function Ddata() {
  const {
    rows = [],
    labels = [],
    loading,
  } = useAggSeries({
    path: "aggDayBuilding",
    limit: 7,
    sumField: "elecSum",
    scale: 1,        // 만단위 쓰면 10000, 원본 그대로면 1
    keyType: "day",
  });
  

  if (loading) return <p className="text-xs text-gray-500">로딩중...</p>;
  if (!rows.length) return <p className="text-xs text-gray-500">데이터가 없습니다.</p>;
  console.log({ loading, labelsLen: labels?.length, rowsLen: rows?.length });
  return (
    <div className="w-full h-[260px]"> {/* ✅ 높이 고정 */}
      <AggBarChart
        title="일별 전력 사용량"
        labels={labels}
        rows={rows}
        yMin={0}
        yMax={4000}
        thresholds={{ warn: 2000, danger: 3500 }}
        unitLabel="단위(kWh)"
      />
    </div>
  );
}
