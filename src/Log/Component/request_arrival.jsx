import CloseIcon from "../../assets/icons/close.png";
import { useState } from "react";

export default function RequestArrival({ data, onClose, onReply }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* 외곽 테두리 박스 (짙은 파랑) */}
      <div className="w-[600px] border-[5px] border-[#054E76] rounded-xl bg-[#DCE6EB] relative p-10">

        {/* 닫기 버튼 */}
        <img
          src={CloseIcon}
          className="absolute top-4 right-4 w-[28px] cursor-pointer"
          onClick={onClose}
        />

        {/* 타이틀 */}
        <h2 className="text-[26px] font-bold text-center text-[#054E76] mb-6">
          불편 사항
        </h2>

        {/* 내부 흰 박스 */}
        <div className="bg-white w-[540px] mx-auto rounded-lg p-6 shadow-lg">

          {/* 제목 */}
          <div className="mb-3 flex items-center">
            <span className="mr-3 text-[18px] font-medium">제목 :</span>
            <input
              type="text"
              defaultValue={data.title}
              className="border border-gray-400 px-2 py-1 w-[330px] text-[17px]"
            />
          </div>

          {/* 일시 (date input) */}
          <div className="mb-3 flex items-center">
            <span className="mr-3 text-[18px] font-medium">일시 :</span>
            <input
              type="date"
              defaultValue={data.date}
              className="border border-gray-400 px-2 py-1 w-[330px] text-[17px]"
            />
          </div>

          {/* 장소 (층 + 호수 + 필터 아이콘) */}
          <div className="mb-3 flex items-center">
            <span className="mr-3 text-[18px] font-medium">장소 :</span>

            {/* 층 Select */}
            <div className="relative mr-2">
              <select
                defaultValue={data.floor}
                className="border border-gray-400 px-2 py-1 w-[120px] text-[17px] appearance-none"
              >
                <option>1F</option>
                <option>2F</option>
                <option>3F</option>
                <option>4F</option>
              </select>

    
            </div>

            {/* 호수 Select */}
            <div className="relative">
              <select
                defaultValue={data.room}
                className="border border-gray-400 px-2 py-1 w-[120px] text-[17px] appearance-none"
              >
                <option>101</option>
                <option>102</option>
                <option>201</option>
                <option>202</option>
              </select>

            
            </div>
          </div>

          {/* 항목 */}
          <div className="mb-3 text-[18px]">
            <span className="font-medium mr-3">항목 :</span>
            <label className="mr-4"><input type="radio" name="type" /> 전기</label>
            <label className="mr-4"><input type="radio" name="type" /> 온도</label>
            <label className="mr-4"><input type="radio" name="type" /> 수도</label>
            <label><input type="radio" name="type" /> 가스</label>
          </div>

          {/* 내용 */}
          <div className="mt-4">
            <span className="text-[17px] font-medium">내용</span>
            <textarea
              defaultValue={data.content}
              className="block border border-[#1A6CA8] resize-none mt-2 w-[390px] h-[210px] p-3 text-[17px]"
            />
          </div>
        </div>

        {/* 답장 버튼 */}
        <div className="w-full flex justify-center mt-6">
          <button
            onClick={onReply}
            className="px-10 py-2 text-[20px] bg-[#054E76] text-white rounded-md"
          >
            답장
          </button>
        </div>
      </div>
    </div>
  );
}
