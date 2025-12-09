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

  // ------------------------------------------------------------
  // 🟣 실시간 알림 처리용 상태들
  // ------------------------------------------------------------

  const [prevSignatures, setPrevSignatures] = useState([]); 
  // 이전 알림들의 signature 목록 (중복 판별용)

  const [alertQueue, setAlertQueue] = useState([]); 
  // 새 알림들이 들어오는 FIFO 큐

  const [showingAlert, setShowingAlert] = useState(null); 
  // 현재 화면에 표시 중인 알림

  const [isShowing, setIsShowing] = useState(false); 
  // 드롭다운이 표시 중인지 여부


  // ------------------------------------------------------------
  // 🔵 1. Firebase 실시간 알림 구독
  // ------------------------------------------------------------
  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const floors = snapshot.val() || {};
      const merged = [];

      Object.entries(floors).forEach(([floor, content]) => {
        if (!content) return;

        // 날짜 폴더 방식
        if (typeof content === "object" && !content.level) {
          Object.entries(content).forEach(([dateKey, items]) => {
            Object.entries(items).forEach(([id, alert]) => {
              merged.push({ id, floor, ...alert });
            });
          });
        }

        // 단일 알림 방식
        else {
          Object.entries(content).forEach(([id, alert]) => {
            merged.push({ id, floor, ...alert });
          });
        }
      });

      setAlerts(merged);
    });
  }, []);


  // ------------------------------------------------------------
  // 🔵 2. 매핑(한글 변환)
  // ------------------------------------------------------------
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


  // 변환된 알림 리스트
  const converted = alerts.map((a) => ({
    id: a.id,
    floor: a.floor,
    level: levelMap[a.level] ?? a.level,
    metric: metricMap[a.metric] ?? a.metric,
    reason: reasonMap[a.reason] ?? a.reason,
    createdAt: a.createdAt,
  }));

  const requestList = converted.filter((a) => a.level === "경고");
  const problemList = converted.filter(
    (a) => a.level === "문제" || a.level === "경고"
  );


  // ------------------------------------------------------------
  // 🟠 3. 신규 알림 signature 생성 & 큐에 넣기
  // ------------------------------------------------------------
  /*
     signature = "층-항목-레벨"
     예: "5층-전력-경고"
     
     → 같은 signature는 같은 종류의 알림으로 판단하고 중복 표시를 막음
  */
  useEffect(() => {
    if (converted.length === 0) return;

    // 새로 들어온 알림만 찾는다
    converted.forEach((alert) => {
      const signature = `${alert.floor}-${alert.metric}-${alert.level}`;

      // signature가 이전에 없으면 → 신규 알림
      const isNew = !prevSignatures.includes(signature);

      if (isNew) {
        // 큐에 추가
        setAlertQueue((prev) => [...prev, alert]);

        // signature 저장
        setPrevSignatures((prev) => [...prev, signature]);
      }
    });
  }, [converted]);


  // ------------------------------------------------------------
  // 🟡 4. 큐에서 하나씩 꺼내서 드롭다운 표시
  //     showing 중이면 대기, showing 끝나면 다음 알림 표시
  // ------------------------------------------------------------
  useEffect(() => {
    // 이미 팝업 표시 중이면 대기
    if (isShowing) return;

    // 큐가 비었으면 아무것도 안 함
    if (alertQueue.length === 0) return;

    // 큐의 첫 번째 알림을 꺼냄
    const nextAlert = alertQueue[0];

    // queue에서 제거
    setAlertQueue((prev) => prev.slice(1));

    // 표시 시작
    setShowingAlert(nextAlert);
    setIsShowing(true);

    // 3초 뒤 showing 상태 false로 (드롭다운 컴포넌트 내부 애니메이션 타이밍과 맞춤)
    const timer = setTimeout(() => {
      setIsShowing(false);
      setShowingAlert(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [alertQueue, isShowing]);


  return (
    <div className="w-full h-full p-6">
      <AdminLayout />

      {/* ------------------------------------------------------------
          🔵 우측 패널 UI
      ------------------------------------------------------------ */}
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
            {tab === "request" && <AlarmRequest items={requestList} />}
            {tab === "problem" && <AlarmProblems items={problemList} />}
          </div>
        </div>
      </div>


      {/* ------------------------------------------------------------
          5. 드롭다운 자동 표시 (신규 알림만 표시)
      ------------------------------------------------------------ */}
      {showingAlert?.level === "경고" && (
        <AlarmDropDownRequest alert={showingAlert} />
      )}

      {showingAlert?.level === "주의" && (
        <AlarmDropDownCaution alert={showingAlert} />
      )}

      {showingAlert?.level === "문제" && (
        <AlarmDropDownUrgent alert={showingAlert} />
      )}
    </div>
  );
}
