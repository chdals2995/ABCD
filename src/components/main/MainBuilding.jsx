// src/components/main/MainBuilding.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";
import Building from "../../assets/imgs/building.png";
import Warning from "../../assets/icons/warning.png";
import Caution from "../../assets/icons/caution.png";
import Circle from "../../assets/icons/circle.png";

export default function MainBuilding({ floors = 10 }) {
  const [floorGroups, setFloorGroups] = useState([]);
  const [buildingName, setBuildingName] = useState("");
  const [alertList, setAlertList] = useState([]);
  const [requestList, setRequestList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuilding = async () => {
      const snapshot = await get(
        ref(rtdb, "buildings/43c82c19-bf2a-4068-9776-dbb0edaa9cc0")
      );

      const alerts = await get(ref(rtdb, "alerts"));
      const requests = await get(ref(rtdb, "requests"));

      if (alerts.exists()) {
        const raw = alerts.val();
        const list = [];

        Object.values(raw).forEach((byFloor) => {
          Object.values(byFloor).forEach((byDate) => {
            Object.values(byDate).forEach((alertItem) => {
              list.push(alertItem);
            });
          });
        });

        setAlertList(list);
      }

      if (requests.exists()) {
        setRequestList(Object.values(requests.val()));
      }

      if (!snapshot.exists()) return;

      const data = snapshot.val();

      const totalFloors = Number(data.floors); // 총 층수 (지상 + 지하)
      const basement = Number(data.down); // 지하 층수
      const groundFloors = totalFloors - basement; // 지상층

      setBuildingName(data.name);

      // 🔥 지하 그룹 (하나의 덩어리)
      const basementGroup =
        basement > 0
          ? [
              {
                type: "basement",
                start: 1,
                end: basement,
              },
            ]
          : [];

      // 🔥 지상층 그룹 10단위로 생성
      const groundGroupCount = Math.ceil(groundFloors / 10);

      const groundGroups = Array.from({ length: groundGroupCount }, (_, i) => ({
        type: "ground",
        start: i * 10 + 1,
        end: Math.min((i + 1) * 10, groundFloors),
      }));

      // 🔥 화면에서는 위 → 아래 순으로 표시해야 하므로 reverse
      const finalGroups = [...groundGroups.reverse(), ...basementGroup];

      setFloorGroups(finalGroups);

      // 🔥 requests 저장
      if (requests.exists()) setRequestList(Object.values(requests.val()));
    };

    fetchBuilding();
  }, []);

  // 🔥 층 문자열 파싱 함수 (10F, 1층, B1 → 모두 처리)
  const parseFloor = (str) => {
    if (!str) return null;
    const s = str.trim();

    // B2, B10 → 지하층
    if (s.startsWith("B")) {
      return { type: "basement", number: Number(s.replace(/[^0-9]/g, "")) };
    }

    // 10F, 3F → 지상층
    if (s.endsWith("F")) {
      return { type: "ground", number: Number(s.replace(/[^0-9]/g, "")) };
    }

    // 1층, 10층 → 지상층
    if (s.includes("층")) {
      return { type: "ground", number: Number(s.replace(/[^0-9]/g, "")) };
    }

    // 숫자만 있는 경우 → 지상층
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
      const parsed = parseFloor(r.floor);
      if (!parsed) return;

      if (parsed.type !== group.type) return;

      if (parsed.number < group.start || parsed.number > group.end) return;

      requests++;
    });

    return { warning, caution, requests };
  };

  const handleClickGroup = (group) => {
    // 🔹 /floors로 이동하면서 "어느 구간인지" 정보를 함께 전달
    navigate("/floors", {
      state: {
        floorTarget: {
          type: group.type, // "ground" | "basement"
          start: group.start,
          end: group.end,
        },
      },
    });
  };

  return (
    // 건물
    <div
      style={{ backgroundImage: `url(${Building})` }}
      className="w-[350px] h-[665px] bg-cover bg-center relative"
    >
      {/* 층분할 */}
      {floorGroups.map((group) => {
        const { warning, caution, requests } = getGroupCounts(group);

        return (
          <div
            key={`${group.type}-${group.start}-${group.end}`}
            className="hover:bg-[#054E76]/50 group relative z-10 cursor-pointer"
            style={{ height: `${665 / floorGroups.length}px` }}
            onClick={() => handleClickGroup(group)}
          >
            {/* 층수 표기 */}
            <div className="font-pyeojin group-hover:text-white ml-[10px] pt-[10px]">
              {/* 지하 포함*/}
              {group.type === "basement"
                ? `B${group.end}층 ~ B${group.start}층`
                : `${group.start}층 ~ ${group.end}층`}
            </div>
            {/* 아이콘 표시 */}
            <div
              className="absolute w-[238px] h-[55px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      flex justify-around items-center bg-white rounded-[10px]"
            >
              {/* 경고 */}
              {warning >= 0 && (
                <div className="relative">
                  <img src={Warning} alt="경고" className="w-[50px] relative" />
                  <p
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[-10px] z-20 
                            font-pyeojin text-[21px] text-[#054E76]"
                  >
                    {warning}
                  </p>
                </div>
              )}
              {/* 주의 */}
              {caution >= 0 && (
                <div className="relative">
                  <img src={Caution} alt="주의" className="w-[50px] relative" />
                  <p
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[-10px] z-20
                            font-pyeojin text-[21px] text-[#054E76]"
                  >
                    {caution}
                  </p>
                </div>
              )}
              {/* 요청 */}
              {requests >= 0 && (
                <div className="relative">
                  <img src={Circle} alt="요청" className="w-[45px] relative" />
                  <p
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                            font-pyeojin text-[21px] text-[#054E76]"
                  >
                    {requests}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* 건물 이름 */}
      <div
        className="bg-white rounded-[10px] absolute bottom-[10px] left-1/2 -translate-x-1/2
                w-[100px] h-[32px]
                font-pyeojin text-[24px] text-center"
      >
        {buildingName}
      </div>
    </div>
  );
}
