// Log.jsx (기록 페이지)
import { useState } from "react";
import AlarmLog from "../Log/alarm_log.jsx"
import AdminLayout from "../layout/AdminLayout.jsx";
import CheckLog from "../Log/check_log.jsx"; 

export default function Log() {
 
  const [tab, setTab] = useState("alarm"); // alarm | check

  return (
    <div className="w-full h-screen overflow-hidden bg-white p-6">
      <AdminLayout />

      {/* 상단 탭 */}
      <div className="flex justify-center gap-6 mb-6 text-[36px] font-bold ">
        <button
          className={tab === "alarm" ? "text-[#054E76]" : "text-gray-400 cursor-pointer" }
          onClick={() => setTab("alarm")}
        >
          알림기록
        </button>

        <button
          className={tab === "check" ? "text-[#054E76]" : "text-gray-400 cursor-pointer"}
          onClick={() => setTab("check")}
        >
          점검기록
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "alarm" && <AlarmLog />}
      {tab === "check" && <CheckLog />}
    </div>
  );
}
