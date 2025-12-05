// Log.jsx (기록 페이지)

import { useState } from "react";
import AlarmLog from "./AlarmLog";
import AdminLayout from "../../layout/AdminLayout.jsx";
// import CheckLog from "./CheckLog"; // 아직 안 만든 경우 주석 가능

export default function Log() {
  const [tab, setTab] = useState("alarm"); // alarm | check

  return (
    <div className="w-full h-full bg-white p-6">

      {/* 상단 탭 */}
      <div className="flex justify-center gap-6 mb-6 text-[36px] font-bold">
        <button
          className={tab === "alarm" ? "text-[#054E76]" : "text-gray-400 "}
          onClick={() => setTab("alarm")}
        >
          알림기록
        </button>

        <button
          className={tab === "check" ? "text-[#054E76]" : "text-gray-400"}
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
