import { useState, useEffect } from "react";
import { rtdb } from "../../firebase/config.js";
import { ref, onValue } from "firebase/database";
import AlarmRequest from "./alarm_request.jsx";
import AlarmProblems from "./alarm_problems.jsx";
import AdminLayout from "../../layout/AdminLayout.jsx";
// import AlarmProblems from "./alarm_problems.jsx";


export default function Alarm() {
  const [tab, setTab] = useState("request");
  const [alerts, setAlerts] = useState([]);
  
  // DB에서 알림 가져오기
  useEffect(() => {
  const alertsRef = ref(rtdb, "alerts");

  return onValue(alertsRef, (snapshot) => {
    const floors = snapshot.val() || {};
    const merged = [];

    Object.entries(floors).forEach(([floor, content]) => {
      if (!content) return;

      // 만약 content가 날짜 폴더를 가진 경우
      if (typeof content === "object" && !content.level) {
        Object.entries(content).forEach(([dateKey, alerts]) => {
          Object.entries(alerts).forEach(([id, alert]) => {
            merged.push({
              id,
              floor,
              dateKey,
              ...alert,
            });
          });
        });
      }

      // 만약 content 바로 아래 알림들이 있는 경우
      else if (content.level || content.createdAt) {
        Object.entries(content).forEach(([id, alert]) => {
          merged.push({
            id,
            floor,
            ...alert,
          });
        });
      }
    });

    setAlerts(merged);
  });
}, []);


        
        const levelMap = {
        danger: "문제",
        warning: "경고",
        caution: "주의",
        normal: "정상",
      };

      const metricMap = {
        water: "수도",
        power: "전력",
        gas: "가스",
        temp: "온도",
      };

      const reasonMap = {
        strong_overload_from_caution: "과부하 가능성이 감지되었습니다.",
      };

      const converted = alerts.map(a => ({
        id: a.id,
        floor: a.floor,
        level: levelMap[a.level] ?? a.level,
        metric: metricMap[a.metric] ?? a.metric,
        reason: reasonMap[a.reason] ?? a.reason,
        createdAt: a.createdAt,
      }));


      const requestList = converted.filter(a => a.level === "경고");
      const problemList = converted.filter(a => a.level === "문제" || a.level === "경고");



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
        {tab === "request" && <AlarmRequest items={requestList} />}
        {tab === "problem" && <AlarmProblems items={problemList} />}

      </div>

     </div>
    </div>
  </div>
  );
}
