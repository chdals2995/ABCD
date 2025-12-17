// src/alarm/AlarmDrawer.jsx
import { useEffect, useState } from "react";
import AlarmRequest from "./alarm_request.jsx";
import AlarmProblems from "./alarm_problems.jsx";

import { rtdb } from "../firebase/config";
import { ref, onValue } from "firebase/database";

import "./alarm_effects.css";

export default function AlarmDrawer({ open, tab, onClose, onTabChange }) {
  const [requestList, setRequestList] = useState([]);
  const [problemList, setProblemList] = useState([]);

  useEffect(() => {
    if (!open) return;

    const reqRef = ref(rtdb, "requests");
    const unReq = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setRequestList([]);

      const list = Object.entries(data).map(([id, r]) => ({
        id,
        title: r.title || "",
        content: r.content || "",
        status: r.status || "접수",
        floor: r.floor || "",
        room: r.room || "",
        type: r.type || "",
        createdAt: Number(r.createdAt) || 0,
      }));

      list.sort((a, b) => b.createdAt - a.createdAt);
      setRequestList(list);
    });

    return () => unReq();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const alertsRef = ref(rtdb, "alerts");
    const unAlerts = onValue(alertsRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw) return setProblemList([]);

      const arr = [];
      Object.entries(raw).forEach(([floor, items]) => {
        Object.entries(items || {}).forEach(([dateKey, dayAlerts]) => {
          Object.entries(dayAlerts || {}).forEach(([id, alert]) => {
            arr.push({ id, floor, dateKey, ...alert });
          });
        });
      });

      setProblemList(arr);
    });

    return () => unAlerts();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="
        fixed right-0 top-[68px]
        w-[372px] h-[calc(100vh-68px)]
        bg-[#E6EEF2] pt-[20px]
        border-l-[1px]
        border-b-[1px] border-[#054E76]
        overflow-hidden z-[9999]
        flex flex-col items-center
      "
    >
      {/* 탭 + 닫기 (고정) */}
      <div className="w-[335px] flex items-center justify-between mb-2 shrink-0">
        <div className="flex w-[280px] h-[48px] bg-[#054E76]">
          <div
            className={`flex flex-1 justify-center items-center text-[20px] cursor-pointer
              ${
                tab === "problem"
                  ? "bg-white text-black font-bold"
                  : "text-white"
              }
            `}
            onClick={() => onTabChange?.("problem")}
          >
            문제
          </div>

          <div
            className={`flex flex-1 justify-center items-center text-[20px] cursor-pointer
              ${
                tab === "request"
                  ? "bg-white text-black font-bold"
                  : "text-white"
              }
            `}
            onClick={() => onTabChange?.("request")}
          >
            요청
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-[44px] h-[44px] rounded-lg bg-white border border-[#054E76] text-[#054E76] font-bold"
          aria-label="close"
          title="닫기"
        >
          ✕
        </button>
      </div>

      {/* ✅ 탭 내용 영역: 스크롤 만들지 말고, 자식이 h-full로 채우게 */}
      <div className="w-[335px] flex-1 min-h-0 bg-white overflow-hidden">
        {tab === "problem" && <AlarmProblems items={problemList} />}
        {tab === "request" && <AlarmRequest items={requestList} />}
      </div>
    </div>
  );
}
