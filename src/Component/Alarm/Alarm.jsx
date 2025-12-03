import { useState } from "react";
import AlarmRequest from "./alarm_request.jsx";
// import AlarmProblems from "./alarm_problems.jsx";

export default function Alarm() {
  const [tab, setTab] = useState("request");

  return (
    <div 
      className="
        absolute right-0 top-0 
        w-[371px] h-[884px]
        bg-[#E6EEF2]
        pt-[68px]
      "
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
      <div className="overflow-y-auto h-[calc(100vh-48px)]">
        {tab === "request" && <AlarmRequest />}
        {tab === "problem" && <AlarmProblems />}
      </div>

    </div>
    </div>
  );
}
