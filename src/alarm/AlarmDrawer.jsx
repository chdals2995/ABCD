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

  // ✅ 열렸을 때만 구독
  useEffect(() => {
    if (!open) return;

    const reqRef = ref(rtdb, "requests");
    const unReq = onValue(reqRef, (snapshot) => {
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
      if (!raw) {
        setProblemList([]);
        return;
      }

      const arr = [];
      Object.entries(raw).forEach(([floor, items]) => {
        if (!items) return;

        Object.entries(items).forEach(([dateKey, dayAlerts]) => {
          Object.entries(dayAlerts || {}).forEach(([id, alert]) => {
            arr.push({
              id,
              floor,
              dateKey,
              ...alert,
            });
          });
        });
      });

      setProblemList(arr);
    });

    return () => unAlerts();
  }, [open]);

  if (!open) return null;

  return (
    // ✅ 화면 전체 덮는 오버레이/래퍼 없음 (밖 클릭해도 안 닫힘 + 밖 UI 클릭 가능)
    <div
      className="
        fixed right-0 top-[68px]
        w-[372px] h-[calc(100vh-68px)]
        bg-[#E6EEF2] pt-[20px]
        border-l-[1px] border-[#054E76]
        overflow-hidden z-[9999]
        animate-[fadeIn_0.2s_ease-out]
      "
    >
      <div className="flex flex-col items-center">
        {/* 상단: 탭 + 닫기 */}
        <div className="w-[335px] flex items-center justify-between mb-2">
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

          {/* ✅ 닫기는 버튼으로만 */}
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

        {/* 내용 */}
        <div className="w-[335px] h-[calc(100vh-68px-20px-48px-16px)] bg-white overflow-y-auto">
          {tab === "problem" && <AlarmProblems items={problemList} />}
          {tab === "request" && <AlarmRequest items={requestList} />}
        </div>
      </div>
    </div>
  );
}
