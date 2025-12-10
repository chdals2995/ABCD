import Mdata from "./Mdata";
import Ddata from "./Ddata";
import DataTable from "./DataTable";
import { useState } from "react";
import DataModal from "../DataModal";
import CloseButton from "../../../assets/CloseButton";

export default function Sdata(){
const [isOpen, setIsOpen] = useState(false); // 모달 (여 / 닫힘)
const [mode, setMode] = useState("day"); // "day" 또는 "month"

// "단위(일)" 버튼 클릭 시 발생
const openDayModal = () => {
    setMode("day");
    setIsOpen(true);
};

// "단위(월)" 버튼 클릭 시 발생
const openMonthModal = () => {
    setMode("month");
    setIsOpen(true);
};


const closeModal = () => {
    setIsOpen(false);
}

    return(
        <div className="flex h-full flex-col text-sm">
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
           {/* 🔹 Modal에 isOpen, onClose, children 전달 */}
      <DataModal isOpen={isOpen} onClose={closeModal}>
        <div className="w-full h-full flex flex-col">
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#054E76]">
          {/* 탭 영역 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("day")}
                className={`
                  px-3 py-1 text-sm font-semibold rounded-t
                  ${
                    mode === "day"
                      ? "bg-white text-[#054E76] border border-b-0 border-[#054E76]"
                      : "bg-transparent text-gray-500 border-b-2 border-transparent hover:text-[#054E76]"
                  }
                `}
              >
                일별
              </button>

              <button
                type="button"
                onClick={() => setMode("month")}
                className={`
                  px-3 py-1 text-sm font-semibold rounded-t
                  ${
                    mode === "month"
                      ? "bg-white text-[#054E76] border border-b-0 border-[#054E76]"
                      : "bg-transparent text-gray-500 border-b-2 border-transparent hover:text-[#054E76]"
                  }
                `}
              >
                월별
              </button>
            </div>

            <CloseButton onClick={closeModal}/>

            
            {/* <button                       ============================ 닫기버튼 ============================
              onClick={closeModal}
              className="px-2 py-1 border border-[#054E76] rounded text-sm"
            >
              닫기
            </button> */}
            
          </div>

          {/* 내용 영역 - Ddata / Mdata 중 하나 렌더링 */}
          <div className="flex-1 p-4 overflow-hidden bg-white">
             {mode === "day" ? (<> <Ddata /><DataTable /> </>) : (<Mdata />)}
          </div>
        </div>
        {/* ✅ 아래에 가로형 표 붙이기 */}
      </DataModal>
      <Ddata />
    </div>
        )
    }