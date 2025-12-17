// MainBuilding
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";
import Building from "../../assets/imgs/building.png";
import Warning from "../../assets/icons/warning.png";
import Caution from "../../assets/icons/caution.png";
import Circle from "../../assets/icons/circle.png";


  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
  // -------------------------
  // alerts (오늘 + 문제만)
  // -------------------------
  const alertRef = ref(rtdb, "alerts");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const unsubscribeAlerts = onValue(alertRef, (snap) => {
    if (!snap.exists()) {
      setAlertList([]);
      return;
    }

    const list = [];

    Object.values(snap.val()).forEach((byFloor) => {
      Object.values(byFloor).forEach((byDate) => {
        Object.values(byDate).forEach((alert) => {
          // ✅ normal 제외
          if (alert.level === "normal") return;

          // ✅ 오늘만 (timestamp 기준)
          const time = Number(alert.createdAt);
          if (
            time < todayStart.getTime() ||
            time > todayEnd.getTime()
          )
            return;

          list.push(alert);
        });
      });
    });

    setAlertList(list);
  });

  return () => unsubscribeAlerts();
}, []);

  // -------------------------
  // requests (오늘 + 미완료)
  // -------------------------
  useEffect(() => {
  const requestRef = ref(rtdb, "requests");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const unsubscribeRequests = onValue(requestRef, (snap) => {
    if (!snap.exists()) {
      setRequestList([]);
      return;
    }

    const list = Object.values(snap.val()).filter((r) => {
      if (r.status === "완료") return false;

      const time = Number(r.createdAt);
      return (
        time >= todayStart.getTime() &&
        time <= todayEnd.getTime()
      );
    });

    setRequestList(list);
  });

  return () => unsubscribeRequests();
}, []);


  // ===============================
  // 층 나누기
  // ===============================
  const parseFloor = (str) => {
    if (!str) return null;
    const s = str.trim();

    if (s.startsWith("B")) {
      return { type: "basement", number: Number(s.replace(/[^0-9]/g, "")) };
    }

    if (s.endsWith("F") || s.includes("층")) {
      return { type: "ground", number: Number(s.replace(/[^0-9]/g, "")) };
    }

    if (!isNaN(Number(s))) {
      return { type: "ground", number: Number(s) };
    }

    return null;
  };

//   아이콘
  const getGroupCounts = (group) => {
    let warning = 0; // 경고
    let caution = 0; // 주의
    let requests = 0; // 요청

    // -------------------------
    // ① 경고(alerts) 카운트
    // -------------------------
    alertList.forEach((a) => {
      if (a.level === "normal") return;

      const parsed = parseFloor(a.floor);
      if (!parsed) return;

      // 지하/지상 구분
      if (parsed.type !== group.type) return;

      // 범위 안인지 체크
      if (parsed.number < group.start || parsed.number > group.end) return;

      if (a.level === "warning") warning++;
      if (a.level === "caution") caution++;
    });

    // -------------------------
    // ② 요청(requests) 카운트
    // -------------------------
    requestList.forEach((r) => {

      if (r.status === "완료") return;

      const parsed = parseFloor(r.floor);
      if (!parsed) return;

      if (parsed.type !== group.type) return;

      if (parsed.number < group.start || parsed.number > group.end) return;

      requests++;
    });

    return { warning, caution, requests };
  };


    return(
        // 건물
        <div style={{ backgroundImage: `url(${Building})` }}
        className="w-[350px] h-[665px] bg-cover bg-center relative">
            {/* 층분할 */}
            {floorGroups.map((group) => {
                const { warning, caution, requests } = getGroupCounts(group);

                return (
                <div
                    key={`${group.type}-${group.start}-${group.end}`}
                    className="hover:bg-[#054E76]/50 group relative z-10"
                    style={{ height: `${665/floorGroups.length}px`}}
                >
                    {/* 층수 표기 */}
                    <div className="font-pyeojin group-hover:text-white ml-[10px] pt-[10px]">
                        {/* 지하 포함*/}
                        {group.type === "basement"
                        ? `B${group.end}층 ~ B${group.start}층`
                        : `${group.start}층 ~ ${group.end}층`}
                    </div>
                    {/* 아이콘 표시 */}
                    <div className="absolute w-[238px] h-[55px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      flex justify-around items-center bg-white rounded-[10px]">
                        {/* 경고 */}
                        {warning >= 0 && (
                        <div className="relative">
                          <img src={Warning} alt="경고" className="w-[50px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[-10px] z-20 
                            font-pyeojin text-[21px] text-[#054E76]"
                            >{warning}</p>
                        </div>
                        )}
                        {/* 주의 */}
                        {caution >= 0 && (
                        <div className="relative">
                          <img src={Caution} alt="주의" className="w-[50px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[-10px] z-20
                            font-pyeojin text-[21px] text-[#054E76]"
                            >{caution}</p>
                        </div>
                        )}
                        {/* 요청 */}
                        {requests >= 0 && (
                        <div className="relative">
                          <img src={Circle} alt="요청" className="w-[45px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                            font-pyeojin text-[21px] text-[#054E76]"
                            >{requests}</p>
                        </div>
                        )}
                    </div>
                </div>
            )})}
            {/* 건물 이름 */}
            <div className="bg-white rounded-[10px] absolute bottom-[10px] left-1/2 -translate-x-1/2
                w-[100px] h-[32px]
                font-pyeojin text-[24px] text-center">
                {buildingName}
            </div>
        </div>
    );
}