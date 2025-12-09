import { useState, useEffect } from "react";
import { rtdb } from "../../firebase/config.js";
import { ref, onValue } from "firebase/database";
import AdminLayout from "../../layout/AdminLayout.jsx";

import AlarmRequest from "./alarm_request.jsx";
import AlarmProblems from "./alarm_problems.jsx";

import AlarmDropDownRequest from "./alarm_dropdown_request.jsx";
import AlarmDropDownCaution from "./alarm_dropdown_caution.jsx";
import AlarmDropDownUrgent from "./alarm_dropdown_urgent.jsx";

export default function Alarm() {
    const [tab, setTab] = useState("request");
    const [alerts, setAlerts] = useState([]);

    // 신규 알림 관련 상태
    const [prevSignatures, setPrevSignatures] = useState([]);
    const [alertQueue, setAlertQueue] = useState([]);
    const [showingAlert, setShowingAlert] = useState(null);
    const [isShowing, setIsShowing] = useState(false);

    // --------------------------------------------------------------------
    // 1) Alerts 데이터 실시간 수신
    // --------------------------------------------------------------------
    useEffect(() => {
      const alertsRef = ref(rtdb, "alerts");

      return onValue(alertsRef, (snapshot) => {
        const floors = snapshot.val() || {};
        const merged = [];

        Object.entries(floors).forEach(([floor, content]) => {
          if (!content) return;

          if (typeof content === "object" && !content.level) {
            Object.entries(content).forEach(([dateKey, items]) => {
              Object.entries(items).forEach(([id, alert]) => {
                merged.push({ id, floor, ...alert });
              });
            });
          } else {
            Object.entries(content).forEach(([id, alert]) => {
              merged.push({ id, floor, ...alert });
            });
          }
        });

        setAlerts(merged);
      });
    }, []);

    // --------------------------------------------------------------------
    // 2) 한글 변환 매핑
    // --------------------------------------------------------------------
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
      strong_overload_from_normal: "기준치를 크게 초과한 이상 수치가 감지되었습니다.",
    };

    const converted = alerts.map((a) => ({
      id: a.id,
      floor: a.floor,
      level: levelMap[a.level] ?? a.level,
      metric: metricMap[a.metric] ?? a.metric,
      reason: reasonMap[a.reason] ?? a.reason,
      createdAt: a.createdAt,
      read: a.read ?? false,
    }));

    const problemList = converted.filter((a) => a.level === "문제" || a.level === "경고");

    // --------------------------------------------------------------------
    // 3) 신규 알림 signature 판별 → alertQueue로 적재
    // --------------------------------------------------------------------
    useEffect(() => {
      converted.forEach((alert) => {
        const signature = `${alert.floor}-${alert.metric}-${alert.level}`;

        if (!prevSignatures.includes(signature)) {
          setAlertQueue((prev) => [...prev, alert]);
          setPrevSignatures((prev) => [...prev, signature]);
        }
      });
    }, [converted, prevSignatures]);

    // --------------------------------------------------------------------
    // 🔥 4) 신규 알림 큐 소비 로직 (ESLint 경고 제거용)
    // --------------------------------------------------------------------
    const consumeNextAlert = () => {
      setAlertQueue((prevQueue) => {
        if (prevQueue.length === 0) return prevQueue;

        const next = prevQueue[0];
        setShowingAlert(next);
        setIsShowing(true);

        return prevQueue.slice(1);
      });
    };

    // --------------------------------------------------------------------
    // 5) alertQueue 변화 감지 → showing 중 아니면 다음꺼 처리
    // --------------------------------------------------------------------
    useEffect(() => {
      if (!isShowing && alertQueue.length > 0) {
        consumeNextAlert();
      }
    }, [alertQueue, isShowing]);

    // --------------------------------------------------------------------
    // 6) 알림 표시 3초 후 자동 종료
    // --------------------------------------------------------------------
    useEffect(() => {
      if (!isShowing) return;

      const timer = setTimeout(() => {
        setIsShowing(false);
        setShowingAlert(null);
      }, 3000);

      return () => clearTimeout(timer);
    }, [isShowing]);

    return (
      <div className="w-full h-full p-6">
        <AdminLayout />

        {/* 우측 패널 */}
        <div className="absolute right-0 top-17 w-[372px] h-[860px] bg-[#E6EEF2] pt-[20px] border border-[#054E76]">
          <div className="flex flex-col items-center">

            {/* 탭 */}
            <div className="flex w-[335px] h-[48px] bg-[#054E76]">
              <div
                className={`flex flex-1 justify-center items-center text-[20px] cursor-pointer
                  ${tab === "request" ? "bg-white text-black font-bold" : "text-white"}`}
                onClick={() => setTab("request")}
              >
                요청
              </div>

              <div
                className={`flex flex-1 justify-center items-center text-[20px] cursor-pointer
                  ${tab === "problem" ? "bg-white text-black font-bold" : "text-white"}`}
                onClick={() => setTab("problem")}
              >
                문제
              </div>
            </div>

            {/* 리스트 */}
            <div className="w-[335px] h-[770px] overflow-y-auto bg-white scrollbar-hide">
              {tab === "request" && <div>민원 데이터 들어오면 표시됨</div>}
              {tab === "problem" && <AlarmProblems items={problemList} />}
            </div>
          </div>
        </div>

        {/* 신규 알림 드롭다운 표시 */}
        {showingAlert?.level === "경고" && <AlarmDropDownRequest alert={showingAlert} />}
        {showingAlert?.level === "주의" && <AlarmDropDownCaution alert={showingAlert} />}
        {showingAlert?.level === "문제" && <AlarmDropDownUrgent alert={showingAlert} />}
      </div>
    );
}
