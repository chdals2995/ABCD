import { useEffect, useState, useRef } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

import login from "../../assets/icons/login.png";
import alert from "../../assets/icons/alert.png";
import alarm from "../../assets/icons/alarm.png";
import warning from "../../assets/icons/iconRed.png";

export default function TopMenu() {
  const [alertCount, setAlertCount] = useState(0); // 경고/주의 개수
  const [requestCount, setRequestCount] = useState(0); // 요청 개수
  const [notification, setNotification] = useState(null); // 알림팝업 데이터

  // 이전 카운트 저장용
  const prevAlertCount = useRef(0);
  const prevRequestCount = useRef(0);
  const notificationTimer = useRef(null);

  const METRIC_LABEL = {
    elec: "전기",
    water: "수도",
    gas: "가스",
    temp: "온도",
  };

  function getReasonText(reason, metric) {
    if (!reason) return "";

    const metricLabel = METRIC_LABEL[metric] || "";

    switch (reason) {
      // ---------------- 새 alert 로직 기준 코드들 ----------------
      case "strong_overload_from_normal":
        // normal → warning (강한 과부하)
        return `${metricLabel} 사용량 과부하`;

      case "sustained_caution_from_normal":
        // normal → caution (주의 구간이 일정 시간 유지)
        return `${metricLabel} 사용량 주의`;

      case "strong_overload_from_caution":
        // caution → warning (이미 주의였는데 더 심해짐)
        return `${metricLabel} 사용량 주의에서 경고로 전환`;

      case "long_caution_escalation":
        // caution 상태가 너무 오래 유지되어 warning으로 승격
        return `${metricLabel} 주의에서 오래 지속됨`;

      case "caution_cleared", "downgraded_from_warning":
      return null; // 메시지 안 띄움

      default:
        // 아직 매핑 안 한 새로운 코드가 들어왔을 때
        return "이상 상태가 감지되었습니다.";
    }
  }

  useEffect(() => {
    // 🔥 alerts 실시간 감지
    const alertsRef = ref(rtdb, "alerts");
    const requestsRef = ref(rtdb, "requests");

    const handleAlerts = (snapshot) => {
    if (!snapshot.exists()) return;

    let count = 0;
    let newAlert = null;


    const raw = snapshot.val();
    Object.values(raw).forEach((byFloor) => {
      Object.values(byFloor).forEach((byDate) => {
        Object.values(byDate).forEach((alertItem) => {
          if (alertItem.level === "warning" || alertItem.level === "caution") {
            count++;

      
      // 새 알림이 이전 카운트보다 많으면 가장 최근 alert 가져오기
            if (count > prevAlertCount.current) {
              newAlert = alertItem;
              
            }
          }
        });
      });
    });

    setAlertCount(count);

    if (newAlert) {
    const baseMessage = getReasonText(newAlert.reason, newAlert.metric);
    if (!msg) return;

  setNotification({
    type: "warning",
    icon: newAlert.level === "warning" ? warning : alert,    // 아이콘 파일
    floor: newAlert.floor,
    room: null,
    message: baseMessage
  });

  if (notificationTimer.current) clearTimeout(notificationTimer.current);
  notificationTimer.current = setTimeout(() => setNotification(null), 3000);
}
    prevAlertCount.current = count;
  };

    const handleRequests = (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    setRequestCount(count);

    // 🔥 새 요청이 생겼을 때
  if (count > prevRequestCount.current) {

  const [key, newRequest] = Object.entries(snapshot.val()).pop();

  setNotification({
    type: "request",
    icon: login,
    floor: newRequest.floor,
    room: newRequest.room,
    message: newRequest.title
  });

  if (notificationTimer.current) clearTimeout(notificationTimer.current);
  notificationTimer.current = setTimeout(() => setNotification(null), 3000);
}

    prevRequestCount.current = count;
  };

  const unsubscribeAlerts = onValue(alertsRef, handleAlerts);
    const unsubscribeRequests = onValue(requestsRef, handleRequests);

    return () => {
      // cleanup
      unsubscribeAlerts();
      unsubscribeRequests();
      if (notificationTimer.current) clearTimeout(notificationTimer.current);
    };
  }, []);
    
  return (
    <div>
      {/* 알림표시 */}
      {notification && (
  <div
    className="absolute top-0 left-1/2 -translate-x-1/2 z-50
               bg-white shadow-lg p-4 rounded-xl border border-gray-300 
               flex items-start gap-4 w-[360px]
               animate-[fadeIn_0.25s_ease-out]"
  >
    {/* 좌측 아이콘 + 층/호수 */}
    <div className="flex flex-col items-center w-[70px] text-center">
      <img
        src={notification.icon}
        alt="icon"
        className="w-[34px] h-[34px] mb-1"
      />

      <p className="text-sm font-semibold text-[#054E76]">
        {notification.floor}
      </p>

      {/* request일 때만 room 표시 */}
      {notification.room && (
        <p className="text-xs text-gray-600">{notification.room}</p>
      )}
    </div>

    {/* 우측 메시지 */}
    <div className="flex-1">
      <p className="font-pyeojin text-[#054E76] leading-tight">
        {notification.message}
      </p>
    </div>
  </div>
)}
      {/* TopMenu */}
      <div
        className="TopMenu w-[372px] h-[68px] px-[74px] bg-[#0888D4] 
                absolute top-0 right-0 flex items-center justify-between "
      >
        <img src={login} alt="마이페이지" className="w-[48px] h-[48px]" />
        {/* 문제보기(alerts) */}
        <div className="relative">
          <img src={alert} alt="문제보기" className="w-[48px] h-[48px]" />
          {alertCount > 0 && (
            <div
              className="absolute top-1 -right-2 bg-red-500 rounded-full w-5 h-5 
                                        flex items-center justify-center text-white text-xs"
            >
              {alertCount}
            </div>
          )}
        </div>
        {/* 요청보기(requests) */}
        <div className="relative">
          <img src={alarm} alt="알림보기" className="w-[42px] h-[48px]" />
          {requestCount > 0 && (
            <div
              className="absolute top-1 -right-2 bg-red-500 rounded-full w-5 h-5 
                                        flex items-center justify-center text-white text-xs"
            >
              {requestCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
