// LogRequestArrival.jsx
import CloseIcon from "../../icons/close_icon.png";
import { useState } from "react";

export default function LogRequestArrival({ data, onClose, onNext }) {
  const [status, setStatus] = useState(data.status || "접수");

  return (
    <div className="
      fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50
    ">
      <div className="
        bg-white rounded-[10px] w-[520px] py-8 px-6 relative
      ">
        {/* 닫기 버튼 */}
        <img
          src={CloseIcon}
          onClick={onClose}
          className="w-[28px] h-[28px] absolute right-5 top-5 cursor-pointer"
        />

        {/* 제목 */}
        <div className="text-center text-[24px] font-semibold mb-6">
          Re: 요청사항
        </div>

        {/* 상태 선택 */}
        <div className="flex justify-center gap-6 mb-6 text-[18px]">
          <button onClick={() => setStatus("접수")} className="flex items-center gap-1">
            <span className="w-[8px] h-[8px] rounded-full bg-black inline-block"></span>
            <span className={status === "접수" ? "font-bold" : ""}>접수</span>
          </button>

          <button onClick={() => setStatus("처리중")} className="flex items-center gap-1">
            <span className="w-[8px] h-[8px] rounded-full bg-green-500 inline-block"></span>
            <span className={status === "처리중" ? "font-bold" : ""}>처리중</span>
          </button>

          <button onClick={() => setStatus("완료")} className="flex items-center gap-1">
            <span className="w-[8px] h-[8px] rounded-full bg-blue-500 inline-block"></span>
            <span className={status === "완료" ? "font-bold" : ""}>완료</span>
          </button>
        </div>

        {/* 내용 박스 */}
        <div className="
          bg-[#E8EFF3] w-full h-[340px] rounded-lg flex justify-center items-center
          text-[20px] text-gray-700 whitespace-pre-wrap p-4 border
        ">
          {data.content || "내용 없음"}
        </div>

        {/* 보내기 버튼 */}
        <div className="flex justify-center mt-8">
          <button
            className="
              w-[130px] h-[50px] border border-black rounded-md 
              text-[18px] font-medium hover:bg-gray-100
            "
            onClick={() => onNext(status)}
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}
