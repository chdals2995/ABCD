// src/pages/data/ElecData/Sdata.jsx
import Mdata from "./Mdata";
import Ddata from "./Ddata";
import DataTable from "./dataTable/DataTable";
import { useState } from "react";
import DataModal from "../DataModal";
import CloseButton from "../../../assets/CloseButton";
import ModalDdata from "./ModalDdata";

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
      <div className="mb-1 absolute top-[20px] left-[10px]">
        <h2 className="font-semibold text-base">(건물)전력 사용량 그래프</h2>
        </div>

        <div className="space-x-2 absolute top-[20px] right-[10px]">
          <button
            onClick={openDayModal}
            className="px-[10px] py-[8px] text-xs border-0 rounded bg-[#FFEE69] text-[16px] rounded-[10px] shadow-[rgba(0,0,0,0.2)] shadow-md"
          >
            단위(일)
          </button>
          <button
            onClick={openMonthModal}
            className="px-[10px] py-[8px] text-xs border-0 rounded bg-[#FFEE69] text-[16px] rounded-[10px] shadow-[rgba(0,0,0,0.2)] shadow-md"
          >
            단위(월)
          </button>
        </div>
      
      {/* 모달 */}
      <DataModal isOpen={isOpen} onClose={closeModal}>
        {/* 💙 바깥 카드 안쪽 컨텐츠: 반응형 */}
        <div className="relative flex flex-col w-full h-full max-w-[1000px] mx-auto md:mt-15">
          {/* 닫기 버튼 - 작은 화면에서는 안쪽에, 큰 화면에서는 살짝 밖으로 */}
          <div className="absolute right-2 top-2 md:right-[-55px] md:top-[-45px]">
            <CloseButton onClick={closeModal} />
          </div>

          {/* 상단 탭 */}
          <div className="flex items-start justify-between px-3 md:px-6 pt-1 md:pt-2">
            <div className="flex">
              <button
                type="button"
                onClick={() => setMode("day")}
                className={`
                  px-4 md:px-6 py-2 text-sm font-semibold
                  border border-[#054E76]
                  rounded-t-md
                  ${
                    mode === "day"
                      ? "bg-white text-[#054E76] border-white"
                      : "bg-[#054E76] text-[#FFFFFF] border-[#054E76]"
                  }
                `}
              >
                일별
              </button>
              <button
                type="button"
                onClick={() => setMode("month")}
                className={`
                  px-4 md:px-6 py-2 text-sm font-semibold
                  border border-[#054E76]
                  rounded-t-md -ml-[1px]
                  ${
                    mode === "month"
                      ? "bg-white text-[#054E76] border-white"
                      : "bg-[#054E76] text-[#FFFFFF] border-[#054E76]"
                  }
                `}
              >
                월별
              </button>
            </div>
          </div>

          {/* 안쪽 흰 박스 */}
          <div className="flex-1 px-3 md:px-6 pb-2 md:pb-3 bg-transparent">
            <div className="bg-[#ffffff] w-full h-5/6 px-4 md:px-8 pt-4 md:pt-6 pb-4 flex flex-col overflow-y-auto">
              {/* 제목 */}
              <h3 className="text-base md:text-lg font-semibold mb-4">
                {mode === "day"
                  ? "일별 전력 사용량 그래프(주 단위)"
                  : "월별 전력 사용량 그래프(월 단위)"}
              </h3>

              {/* 차트 + 범례 */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                {/* 범례 */}
                <div className="text-xs md:text-sm mt-2 md:mt-4">
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
                <div className="flex-1 h-[220px] md:h-[280px] lg:h-[325px]">
                  {mode === "day" ? <Ddata /> : <Mdata />}
                </div>
              </div>

              {/* 표 영역 */}
              {mode === "day" && <DataTable />}
            </div>
          </div>
        </div>
      </DataModal>

      {/* 페이지 안에 작은 차트: 모달 열려 있을 때는 안 보이게 */}
      <div className="w-[450px] h-[300px] mt-[30px] ml-[-10px]">
       {!isOpen && <ModalDdata />}
      </div>
    </div>
  );
}
