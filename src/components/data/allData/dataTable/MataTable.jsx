// src/pages/data/ElecData/dataTable/MataTable.jsx
import { useAggSeries } from "../../../../hooks/dataPage/useAggSeries";

export default function MataTable() {
  const { monthData, labels, loading } = useAggSeries();

  if (loading || !monthData.length) {
    return null;
  }

  return (
    <div className="w-full h-[150px] mt-6 overflow-x-auto overflow-y-hidden">
      <table className="min-w-[700px] md:min-w-0 w-full border-collapse text-[11px] md:text-[12px]">
        <thead>
          <tr className="bg-[#B5DCF3]">
            <th className="border px-[5px] py-[12px] text-center">
              단위(월)
            </th>
            {labels.map((label, idx) => (
            <th
            key={`${label}-${idx}`}
            className="border px-[5px] py-[12px] text-center">
            {label}
            </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-[5px] py-[12px] text-center bg-[#B5DCF3] font-semibold">
              사용량 (kWh)
            </td>
            {monthData.map((row, idx) => (
  <td
    key={`${row.date ?? "no-date"}-${idx}`}   // ✅ 중복/undefined 방지
    className="border px-[5px] py-[12px] text-center whitespace-nowrap"
  >
    {Math.floor(row.elecSum ?? 0).toLocaleString()}만
  </td>
))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
