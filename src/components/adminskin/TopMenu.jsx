import { useEffect, useState, useRef } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

import login from "../../assets/icons/login.png";
import alert from "../../assets/icons/alert.png";
import alarm from "../../assets/icons/alarm.png";

export default function TopMenu() {
  const [alertCount, setAlertCount] = useState(0); // 경고/주의 개수
  const [requestCount, setRequestCount] = useState(0); // 요청 개수

  const [notification, setNotification] = useState(null); // 알림팝업 데이터
  const [items, setItems] = useState([]);

  

  // 이전 카운트 저장용
  const prevAlertIds = useRef(new Set());
  const prevRequestIds = useRef(new Set());

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
        return `${metricLabel} 사용량이 기준 대비 크게 증가하여 경고 단계로 전환되었습니다.`;

      case "sustained_caution_from_normal":
        // normal → caution (주의 구간이 일정 시간 유지)
        return `${metricLabel} 사용량이 기준치를 초과한 상태가 지속되어 주의 단계로 전환되었습니다.`;

      case "strong_overload_from_caution":
        // caution → warning (이미 주의였는데 더 심해짐)
        return `${metricLabel} 사용량이 더 증가하여 경고 단계로 격상되었습니다.`;

      case "long_caution_escalation":
        // caution 상태가 너무 오래 유지되어 warning으로 승격
        return `${metricLabel} 주의 상태가 장시간 지속되어 경고 단계로 격상되었습니다.`;

      case "caution_cleared":
        // caution → normal
        return `${metricLabel} 사용량이 다시 기준 범위로 돌아와 주의 상태가 해제되었습니다.`;

      case "downgraded_from_warning":
        // warning → caution
        return `${metricLabel} 경고 상태가 완화되어 주의 단계로 내려갔습니다.`;

      default:
        // 아직 매핑 안 한 새로운 코드가 들어왔을 때
        return "이상 상태가 감지되었습니다.";
    }
  }

  useEffect(() => {
    // 🔥 alerts 실시간 감지
    const alertRef = ref(rtdb, "alerts");
    onValue(alertRef, (snapshot) => {
      let count = 0;

      if (snapshot.exists()) {
        const raw = snapshot.val();

        Object.values(raw).forEach((byFloor) => {
          Object.values(byFloor).forEach((byDate) => {
            Object.values(byDate).forEach((alertItem) => {
              // level: warning / caution
              if (
                alertItem.level === "warning" ||
                alertItem.level === "caution"
              ) {
                count++;
              }
            });
          });
        });
      }
      // 새 알림 여부 판단
      if (count > prevAlert.current) {
        setNotification({
          type: "alert",
          message: "새로운 경고/주의가 등록되었습니다.",
        });

        // 3초 뒤 자동 닫기
        setTimeout(() => setNotification(null), 3000);
      }

      prevAlert.current = count;
      setAlertCount(count);
    });

    // 🔥 requests 실시간 감지
    const reqRef = ref(rtdb, "requests");
    onValue(reqRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRequestCount(0);
        // 알림 비교용 prev도 업데이트
        prevRequest.current = 0;
        return;
      }

      // snapshot.val() 구조가 중첩되어 있을 수 있으므로 안전하게 전체 leaf 개수를 센다
      const raw = snapshot.val();
      const count = Object.keys(raw).length;

      setRequestCount(count);

      // 이전 카운트와 비교해서 새 알림 토스트 띄우기
      if (count > prevRequest.current) {
        setNotification({
          type: "request",
          message: "새로운 요청이 접수되었습니다.",
        });
        setTimeout(() => setNotification(null), 3000);
      }

      prevRequest.current = count;
    });
  }, []);

  useEffect(() => {
    if (alertCount === 0) {
    setItems([]);
    return;
  }
    const floor = alertItem?.floor; 
    if (!floor) return;

    let isMounted = true;
    const alertsRef = ref(rtdb, `alerts/${floor}`);
    

    const unsubscribe = onValue(
      alertsRef,
      (snapshot) => {
        if (!isMounted) return;

        const list = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const val = child.val() || {};
            list.push({
              id: child.key,
              createdAt: val.createdAt,
              level: val.level,
              metric: val.metric,
              reason: val.reason,
              value: val.value,
            });
          });
        }

        // 최신 순 정렬
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setItems(list);
      }
    );
    }, [alertCount]);

 
  
    
  return (
    <div>
      {/* 알림표시 */}
      {notification && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50
                    bg-white shadow-lg p-3 rounded-lg border border-gray-300 
                    animate-[fadeIn_0.2s_ease-out]"
        >
                <div className="w-full h-[180px] border border-gray-200 rounded-[10px] bg-white px-4 py-3 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                    </div>
        
                    <div className="w-full h-[130px] overflow-y-auto text-xs">
                
                    <ul className="space-y-1">
                    {items.map((item) => (
                        <li
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1 rounded-[6px] bg-[#F5F7F9]"
                        >
        
                        {/* 메트릭 / 시간 / 이유 */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between">
                            <span className="font-semibold">
                                {METRIC_LABEL[item.metric] || item.metric || "기타"}
                            </span>
                            </div>
                            {item.reason && (
                            <div className="text-[10px] text-gray-600 truncate">
                                {getReasonText(item.reason, item.metric)}
                            </div>
                            )}
                        </div>
                        </li>
                    ))}
                    </ul>
                
                </div>
        </div>
          <p className="font-pyeojin text-[#054E76]">{notification.message}</p>
        </div>
      )}
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
