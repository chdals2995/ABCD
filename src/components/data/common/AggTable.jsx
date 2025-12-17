// src/components/data/common/AggTable.jsx
export default function AggTable({ labels, rows, leftHeader = "사용량", suffix = "" }) {
  if (!rows?.length) return null;

  return (
    <div className="w-full mt-6 overflow-x-auto">
      <table className="min-w-[700px] md:min-w-0 w-full border-collapse text-[11px] md:text-[12px]">
        <thead>
          <tr className="bg-[#B5DCF3]">
            <th className="border w-[100px] py-[12px] text-center">단위</th>
            {labels.map((label, idx) => (
              <th key={`${label}-${idx}`} className="border w-[100px] py-[12px] text-center">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border w-[100px] py-[12px] text-center bg-[#B5DCF3] font-semibold">
              {leftHeader}
            </td>
            {rows.map((r, idx) => (
              <td
                key={`${r.key}-${idx}`}
                className="border w-[100px] py-[12px] text-center whitespace-nowrap"
              >
                {Math.floor(Number(r.value) || 0).toLocaleString()}{suffix}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
