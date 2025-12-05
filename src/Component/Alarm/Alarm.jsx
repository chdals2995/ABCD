import { useState } from "react";
import AlarmRequest from "./alarm_request.jsx";
import AlarmProblems from "./alarm_problems.jsx";
import AdminLayout from "../../layout/AdminLayout.jsx";
// import AlarmProblems from "./alarm_problems.jsx";

export default function Alarm() {
  const [tab, setTab] = useState("request");
  
  return (
    <div className="w-full h-full p-6">
      <AdminLayout />

    <div className="absolute right-0 top-17 w-[372px] h-[860px]
    bg-[#E6EEF2] pt-[20px] border-[1px] border-[#054E76]"
    >


    
       <div className="flex flex-col items-center">

      
      {/* 상단 탭 */}
      <div className="flex w-[335px] h-[48px]  bg-[#054E76]">
        
        {/* 요청 탭 */}
        <div
          className={`
            flex flex-1 justify-center items-center text-[20px] cursor-pointer
            ${tab === "request"
              ? "bg-white text-black font-bold"
              : "text-white"
            }
            `}
            onClick={() => setTab("request")}
            >
          요청
        </div>

        {/* 문제 탭 */}
        <div
          className={`
            flex flex-1 justify-center items-center text-[20px] cursor-pointer
            ${tab === "problem"
              ? "bg-white text-black font-bold"
              : "text-white"
            }
            `}
            onClick={() => setTab("problem")}
            >
          문제
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="w-[335px] h-[770px] overflow-y-auto bg-white scrollbar-hide scroll-area">
        {tab === "request" && <AlarmRequest />}
        {tab === "problem" && <AlarmProblems />}
        
        
      </div>

     </div>
    </div>
  </div>
  );
}
