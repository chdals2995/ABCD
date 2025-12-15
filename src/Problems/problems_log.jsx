import { useState } from "react";
import Report from "./Report.jsx"; // 문제 입력 모달 컴포넌트
import PlusIcon from "../icons/plus_icon.png"; // 파일명 너에 맞게


export default function ProblemsLog({ problems, onSelect }) {
  const [openReport, setOpenReport] = useState(false);

  return (
    <div className="
          mt-10 border rounded
          p-5 w-[990px] ml-13">

      {/* 제목 + (+) 버튼 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[25px] font-semibold px-1 pt-5">원인내역(타입별)</h3>

        <button
          onClick={() => setOpenReport(true)}
          className="w-8 h-8 rounded-full shadow-md flex items-center justify-center bg-white hover:bg-gray-100 mt-5"
        >
        <img src={PlusIcon} alt="add" className="w-4 h-4" />
      </button>
      </div>

      {/* 상단 구분선 */}
      <div className="w-full border-t border-gray-400 mb-1 mt-5"></div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-center">
            <th className="p-2">타입</th>
            <th className="p-2">호수</th>
            <th className="p-2">발생일시</th>
            <th className="p-2">내용</th>
            <th className="p-2">상태</th>
          </tr>
        </thead>

        <tbody>
          {problems.map((p) => (
            <tr
              key={p.id}
              className="border-b cursor-pointer hover:bg-gray-100"
              onClick={() => onSelect(p)}
            >
              <td className="p-2">{p.type}</td>
              <td className="p-2">{p.room}</td>
              <td className="p-2">
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleString()
                  : "-"}
              </td>
              <td className="p-2">{p.content}</td>

              <td className="p-2">
                {p.status === "완료" ? (
                  <span className="text-blue-500">완료</span>
                ) : (
                  <span className="text-red-500">미완료</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 문제 입력 모달 (Report) */}
      {openReport && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[600px] relative">
            <button
              onClick={() => setOpenReport(false)}
              className="absolute right-4 top-4 text-xl"
            >
              ✕
            </button>

            {/* ★ 문제 입력 모달 본체 = Report */}
            <Report />
          </div>
        </div>
      )}

    </div>
  );
}
