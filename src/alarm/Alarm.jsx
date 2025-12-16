import { useState, useEffect } from "react";
import AlarmRequest from "./alarm_request.jsx";
import AlarmProblems from "./alarm_problems.jsx";
import AdminLayout from "../../layout/AdminLayout.jsx";


import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";


export default function Alarm() {
  const [tab, setTab] = useState("request");


  // ============================
  //  요청사항 데이터 (requests)
  // ============================
  const [requestList, setRequestList] = useState([]);


  useEffect(() => {
    const reqRef = ref(rtdb, "requests");


    return onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRequestList([]);
        return;
      }


      const list = Object.entries(data).map(([id, r]) => ({
        id,
        title: r.title || "",
        content: r.content || "",
        status: r.status || "접수",
        floor: r.floor || "",
        room: r.room || "",
        type: r.type || "",
        createdAt: r.createdAt || 0,
      }));


      // 최신순 정렬
      list.sort((a, b) => b.createdAt - a.createdAt);


      setRequestList(list);
    });
  }, []);


  // ============================
  //  문제 알림(alerts) 데이터
  // ============================
  const [problemList, setProblemList] = useState([]);


  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");


    return onValue(alertsRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw) {
        setProblemList([]);
        return;
      }


      const arr = [];
      Object.entries(raw).forEach(([floor, items]) => {
        if (!items) return;


        Object.entries(items).forEach(([dateKey, dayAlerts]) => {
          if (typeof dayAlerts === "object") {
            Object.entries(dayAlerts).forEach(([id, alert]) => {
              arr.push({
                id,
                floor,
                dateKey,
                ...alert,
              });
            });
          }
        });
      });


      setProblemList(arr);
    });
  }, []);


  return (
    <div className="w-full h-full p-6">
      <AdminLayout />


      <div
        className="
          absolute right-0 top-17
          w-[372px] h-[860px]
          bg-[#E6EEF2] pt-[20px]
          border-[1px] border-[#054E76]
        "
      >
        <div className="flex flex-col items-center">
          {/* 상단 탭 */}
          <div className="flex w-[335px] h-[48px] bg-[#054E76]">
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
