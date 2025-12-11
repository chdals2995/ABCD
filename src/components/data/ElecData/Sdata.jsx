// src/pages/data/ElecData/Sdata.jsx
import Mdata from "./Mdata";
import Ddata from "./Ddata";
import DataTable from "./DataTable";
import { useState } from "react";
import DataModal from "../DataModal";
import CloseButton from "../../../assets/CloseButton";

export default function Sdata() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("day"); // "day" | "month"

  const openDayModal = () => {
    setMode("day");
    setIsOpen(true);
  };

  const openMonthModal = () => {
    setMode("month");
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <div className="flex h-full flex-col text-sm p-10">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-base">Sdata</h2>
        <div className="space-x-2">
          <button
            onClick={openDayModal}
            className="px-2 py-1 text-xs border rounded"
          >
            단위(일)
          </button>
          <button
            onClick={openMonthModal}
            className="px-2 py-1 text-xs border rounded"
          >
            단위(월)
          </button>
        </div>
      </div>

      {/* 모달 */}
      <DataModal isOpen={isOpen} onClose={closeModal}>
        
        {/* 💙 바깥 하늘색 카드 */}
        <div className="w-[1000px] h-[620px] bg-transparent flex flex-col ml-[50%] transform -translate-x-1/2 mt-[50px]">
        <div className= "absolute right-[-55px] top-[-30px]">
         <CloseButton onClick={closeModal} />
        </div>
          {/* 상단 탭 + 닫기 */}
          <div className="flex items-start justify-between px-6 pt-4">
            <div className="flex">
              <button
                type="button"
                onClick={() => setMode("day")}
                className={`
                  px-6 py-2 text-sm font-semibold
                  border border-[#054E76]
                  rounded-t-md
                  ${mode === "day"
                    ? "bg-white text-[#054E76] border-white"
                    : "bg-[#054E76] text-[#FFFFFF] border-[#054E76]"}
                `}
              >
                일별
              </button>
              <button
                type="button"
                onClick={() => setMode("month")}
                className={`
                  px-6 py-2 text-sm font-semibold
                  border border-[#054E76]
                  rounded-t-md -ml-[1px]
                  ${mode === "month"
                    ? "bg-white text-[#054E76] border-white"
                    : "bg-[#054E76] text-[#FFFFFF] border-[#054E76]"}
                `}
              >
                월별
              </button>
            </div>
          </div>

          {/* 안쪽 흰 박스 */}
          <div className="flex-1 px-6 pb-6 bg-transparent">
            <div className="bg-[#ffffff] w-full h-full px-8 pt-6 pb-4 flex flex-col">
              {/* 제목 */}
              <h3 className="text-lg font-semibold mb-4">
                {mode === "day"
                  ? "일별 전력 사용량 그래프(주 단위)"
                  : "월별 전력 사용량 그래프(월 단위)"}
              </h3>

              {/* 차트 + 범례 */}
              <div className="flex gap-10">
                {/* 범례 */}
                <div className="text-sm mt-4">
                  <div className="mb-2 font-semibold">범례</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-4 bg-[#414141]" />
                    <span>위험</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-4 bg-[#E54138]" />
                    <span>주의</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-[#F3D21B]" />
                    <span>정상</span>
                  </div>
                </div>

                {/* 차트 영역 */}
                <div className="flex-1 h-[325px]">
                  {mode === "day" ? <Ddata /> : <Mdata />}
                </div>
              </div>

              {/* 표 영역 */}
              {mode === "day" && <DataTable />}
            </div>
          </div>
        </div>
      </DataModal>

      {/* 페이지 안에 작은 차트도 계속 보여주고 싶으면 유지 */}
      <Ddata />
    </div>
  );
}
