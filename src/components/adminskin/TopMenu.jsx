// src/components/adminskin/TopMenu.jsx
import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/config";

import login from "../../assets/icons/login.png";
import alert from "../../assets/icons/alert.png";
import alarm from "../../assets/icons/alarm.png";
import warning from "../../assets/icons/iconRed.png";

export default function TopMenu({ onOpenAlarm = () => {} }) {
  const [alertCount, setAlertCount] = useState(0); // 경고/주의 개수
  const [requestCount, setRequestCount] = useState(0); // 요청 개수
  const [notification, setNotification] = useState(null); // 상단 팝업 데이터
  const [role, setRole] = useState("");

  // 이전 카운트 저장용
  const prevAlertCount = useRef(0);
  const prevRequestCount = useRef(0);
  const notificationTimer = useRef(null);

  // ✅ 초기 로딩 차단용
  const isInitialAlertLoad = useRef(true);
  const isInitialRequestLoad = useRef(true);

  const prevLatestAlertTime = useRef(0);

  const navigate = useNavigate();

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
      case "strong_overload_from_normal":
        return `${metricLabel} 사용량 과부하`;
      case "sustained_caution_from_normal":
        return `${metricLabel} 사용량 주의`;
      case "strong_overload_from_caution":
        return `${metricLabel} 사용량 주의에서 경고로 전환`;
      case "long_caution_escalation":
        return `${metricLabel} 주의에서 오래 지속됨`;

      case "caution_cleared":
      case "downgraded_from_warning":
        return null; // 메시지 안 띄움

      default:
        return "이상 상태가 감지되었습니다.";
    }
  }

  // ✅ 알림 팝업 클릭 시: 해당 탭 Drawer 열기
  const openByNotification = () => {
    if (!notification) return;
    const tab = notification.type === "request" ? "request" : "problem";
    onOpenAlarm(tab);
    setNotification(null);
  };

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");
    const requestsRef = ref(rtdb, "requests");

    // =========================
    // 🔥 ALERTS
    // =========================
    const handleAlerts = (snapshot) => {
      if (!snapshot.exists()) {
        setAlertCount(0);
        prevAlertCount.current = 0;
        isInitialAlertLoad.current = false;
        return;
      }

      const raw = snapshot.val();
      const latestMap = {};

      Object.entries(raw).forEach(([floorKey, byFloor]) => {
        Object.values(byFloor || {}).forEach((byDate) => {
          Object.values(byDate || {}).forEach((alertItem) => {
            const floor = alertItem.floor || floorKey;
            const metric = alertItem.metric;
            if (!floor || !metric) return;

            const key = `${floor}-${metric}`;
            const time = Number(alertItem.createdAt) || 0;

            if (
              !latestMap[key] ||
              time > Number(latestMap[key].createdAt || 0)
            ) {
              latestMap[key] = { ...alertItem, floor };
            }
          });
        });
      });

      let count = 0;
      let newAlert = null;
      let latestTime = 0;

      Object.values(latestMap).forEach((alertItem) => {
        const time = Number(alertItem.createdAt) || 0;

        if (alertItem.level === "warning" || alertItem.level === "caution") {
          count++;
        }

        if (time > latestTime) {
          latestTime = time;
          newAlert = alertItem;
        }
      });

      setAlertCount(count);

      // ✅ 초기 로딩 이후 + 최신 알림만 팝업
      if (
        !isInitialAlertLoad.current &&
        newAlert &&
        (newAlert.level === "warning" || newAlert.level === "caution") &&
        Number(newAlert.createdAt) > prevLatestAlertTime.current
      ) {
        const baseMessage = getReasonText(newAlert.reason, newAlert.metric);

        if (baseMessage) {
          setNotification({
            type: "problem",
            icon: newAlert.level === "warning" ? warning : alert,
            floor: newAlert.floor,
            room: null,
            message: baseMessage,
          });

          clearTimeout(notificationTimer.current);
          notificationTimer.current = setTimeout(
            () => setNotification(null),
            5000
          );
        }
      }

      prevAlertCount.current = count;
      prevLatestAlertTime.current = latestTime;
      isInitialAlertLoad.current = false;
    };

    // =========================
    // 🔥 REQUESTS
    // =========================
    const handleRequests = (snapshot) => {
      if (!snapshot.exists()) {
        setRequestCount(0);
        prevRequestCount.current = 0;
        isInitialRequestLoad.current = false;
        return;
      }

      const raw = snapshot.val();
      const active = Object.values(raw || {}).filter(
        (r) => r?.status !== "완료"
      );

      const count = active.length;
      setRequestCount(count);

      if (isInitialRequestLoad.current) {
        prevRequestCount.current = count;
        isInitialRequestLoad.current = false;
        return;
      }

      if (count > prevRequestCount.current) {
        const newReq = active
          .slice()
          .sort((a, b) => Number(a.createdAt) - Number(b.createdAt))
          .pop();

        if (newReq) {
          setNotification({
            type: "request",
            icon: login,
            floor: newReq.floor,
            room: newReq.room,
            message: newReq.title,
          });

          clearTimeout(notificationTimer.current);
          notificationTimer.current = setTimeout(
            () => setNotification(null),
            3000
          );
        }
      }

      prevRequestCount.current = count;
    };

    const unAlert = onValue(alertsRef, handleAlerts);
    const unReq = onValue(requestsRef, handleRequests);

    return () => {
      unAlert();
      unReq();
      clearTimeout(notificationTimer.current);
    };
  }, [onOpenAlarm]);

  // role 로딩
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await get(ref(rtdb, `users/${user.uid}`));
      if (snap.exists()) setRole(snap.val().role);
    });

    return () => unsubscribe();
  }, []);

  // 마이페이지 이동
  const goMyPage = () => {
    if (role === "master") navigate("/master");
    else if (role === "admin") navigate("/adminpage");
  };

  return (
    <div>
      {/* 상단 팝업 알림 */}
      {notification && (
        <div
          onClick={openByNotification}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50
                     bg-white shadow-lg p-4 rounded-xl border border-gray-300 
                     flex items-center gap-4 w-[360px] cursor-pointer
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
            {notification.room && (
              <p className="text-xs text-gray-600">{notification.room}</p>
            )}
          </div>

          {/* 우측 메시지 */}
          <div className="flex-1">
            <p className="font-pyeojin text-[#054E76] leading-tight items-center">
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* TopMenu */}
      <div
        className="TopMenu w-[372px] h-[68px] px-[74px] bg-[#0888D4] 
                   absolute top-0 right-0 flex items-center justify-between"
      >
        <img
          src={login}
          alt="마이페이지"
          className="w-[48px] h-[48px] cursor-pointer"
          onClick={goMyPage}
        />

        {/* 문제보기(alerts) -> Drawer problem */}
        <div className="relative">
          <img
            src={alert}
            alt="문제보기"
            className="w-[48px] h-[48px] cursor-pointer"
            onClick={() => onOpenAlarm("problem")}
          />
          {alertCount > 0 && (
            <div
              className="absolute top-1 -right-2 bg-red-500 rounded-full w-5 h-5 
                         flex items-center justify-center text-white text-xs"
            >
              {alertCount}
            </div>
          )}
        </div>

        {/* 요청보기(requests) -> Drawer request */}
        <div className="relative">
          <img
            src={alarm}
            alt="알림보기"
            className="w-[42px] h-[48px] cursor-pointer"
            onClick={() => onOpenAlarm("request")}
          />
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
