import CloseIcon from "../../assets/icons/close.png";
import { useState } from "react";

export default function RequestArrival({ data, onClose, onReply }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* 외곽 테두리 박스 */}
      <div className="w-[630px] h-[710px] border-[5px] border-[#054E76] rounded-xl bg-[#DCE6EB] relative p-10">

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

        {/* 내부 흰 박스 — 중앙 정렬 적용 */}
        <div className="bg-white w-[540px] h-[490px] mx-auto rounded-lg p-6 shadow-lg flex flex-col items-center">

          {/* 제목 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">제목 :</span>
            <input
              type="text"
              defaultValue={data.title}
              className="border border-gray-400 px-2 py-1 w-[330px] text-[17px]"
            />
          </div>

          {/* 일시 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">일시 :</span>
            <input
              type="date"
              defaultValue={data.date}
              className="border border-gray-400 px-2 py-1 w-[330px] text-[17px]"
            />
          </div>

          {/* 장소 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">장소 :</span>

            {/* 건물 선택 */}
            <div className="relative mr-2">
              <select
                defaultValue={data.building ?? ""}
                className="border border-gray-400 px-2 py-1 w-[150px] text-[17px] appearance-none "
              >
                <option value="">건물 선택</option>
                <option value="main">건물</option>
                <option value="tower">주차타워건물</option>
              </select>
            </div>

            {/* 층 선택 (1~20층 자동 생성) */}
            <div className="relative">
              <select
                defaultValue={data.floor ?? ""}
                className="border border-gray-400 px-2 py-1 w-[120px] text-[17px] appearance-none"
              >
                <option value="">층 선택</option>

                {Array.from({ length: 20 }, (_, i) => i + 1).map((floor) => (
                  <option key={floor} value={`${floor}F`}>
                    {floor}F
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 항목 */}
          <div className="mb-3 text-[18px] flex justify-center">
            <span className="font-medium mr-3">항목 :</span>
            <label className="mr-4"><input type="radio" name="type" /> 전기</label>
            <label className="mr-4"><input type="radio" name="type" /> 온도</label>
            <label className="mr-4"><input type="radio" name="type" /> 수도</label>
            <label><input type="radio" name="type" /> 가스</label>
          </div>

          {/* 내용 */}
          <div className="mt-4 flex flex-col items-center w-full">
            <textarea
              defaultValue={data.content}
              className="border border-[#1A6CA8] resize-none mt-2 w-[390px] h-[210px] p-3 text-[17px]"
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
