// src/pages/data/ElecData/dataTable/DataTable.jsx
import { ElecDdata } from "../../../../hooks/dataPage/elec/ElecDdata";

export default function DataTable() {
  const { dailyData, labels, loading } = ElecDdata();

  if (loading || !dailyData.length) {
    return null;
  }

  return (
    <div className="w-full mt-6 overflow-x-auto">
      <table className="min-w-[700px] md:min-w-0 w-full border-collapse text-[11px] md:text-[12px]">
        <thead>
          <tr className="bg-[#B5DCF3]">
            <th className="border w-[100px] py-[12px] text-center">
              단위(요일)
            </th>
            {labels.map((label) => (
              <th
                key={label}
                className="border w-[100px] py-[12px] text-center"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border w-[100px] py-[12px] text-center bg-[#B5DCF3] font-semibold">
              사용량 (kWh)
            </td>
            {dailyData.map((row) => (
              <td
                key={row.date}
                className="border w-[100px] py-[12px] text-center whitespace-nowrap"
              >
                {Math.floor(row.elecSum).toLocaleString()}만
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
