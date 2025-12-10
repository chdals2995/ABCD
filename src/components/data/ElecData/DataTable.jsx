// src/pages/data/DataTable.jsx  (혹은 네가 둔 위치)

import { ElecDdata } from "../../../hooks/dataPage/EelecDdata";

ElecDdata

export default function DataTable() {
  const { dailyData, labels, loading } = ElecDdata();

  if (loading || !dailyData.length) {
    return null; // 또는 "로딩중..." 한 줄 표시
  }

  return (
    <div className="ml-[50%] mt-[20px] translate-x-[-50%] w-full">
      <table className="text-[11px] border-collapse w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-[5px] py-[10px] text-center w-20 text-[15px]">구분</th>
            {labels.map((label) => (
              <th key={label} className="border px-[5px] py-[10px] text-center text-[15px]">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-[5px] py-[10px] text-center text-[15px]">
              전력 사용량 (kWh)
            </td>
            {dailyData.map((row) => (
              <td
                key={row.date}
                className="border px-[5px] py-[10px] text-center text-[15px] whitespace-nowrap"
              >
                {row.elecSum.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                kWh
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
