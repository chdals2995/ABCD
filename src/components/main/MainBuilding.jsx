// MainBuilding
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";
import Building from "../../assets/imgs/building.png";
import Warning from "../../assets/icons/warning.png";
import Caution from "../../assets/icons/caution.png";
import Circle from "../../assets/icons/circle.png";



export default function MainBuilding({floors = 10}){
    const [floorGroups, setFloorGroups] = useState([]);
    const [buildingName, setBuildingName] = useState("");
    const [alertList, setAlertList] = useState([]);
    const [requestList, setRequestList] = useState([]);

  useEffect(() => {
    const fetchBuilding = async () => {
      const snapshot = await get(ref(rtdb, "buildings/43c82c19-bf2a-4068-9776-dbb0edaa9cc0"));


    const alerts = await get(ref(rtdb, "alerts"));
    const requests= await get(ref(rtdb, "requests"));

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

      const groundGroups = Array.from(
        { length: groundGroupCount },
        (_, i) => ({
          type: "ground",
          start: i * 10 + 1,
          end: Math.min((i + 1) * 10, groundFloors),
        })
      );

      // 🔥 화면에서는 위 → 아래 순으로 표시해야 하므로 reverse
      const finalGroups = [...groundGroups.reverse(), ...basementGroup];

      setFloorGroups(finalGroups);

      // 🔥 alerts & requests 저장
      if (alerts.exists()) setAlertList(Object.values(alerts.val()));
      if (requests.exists()) setRequestList(Object.values(requests.val()));
    };
      
    fetchBuilding();
  }, []);


//   아이콘
  const getGroupCounts = (group) => {
    let warning = 0; // 경고
    let caution = 0; // 주의
    let requests = 0; // 요청

    // -------------------------
    // ① 경고(alerts) 카운트
    // -------------------------
    alertList.forEach((a) => {
      if (!a.floor) return;

      let floorNumber = 0;

      if (group.type === "basement") {
        if (!a.floor.startsWith("B")) return;
        floorNumber = Number(a.floor.replace("B", ""));
      } else {
        if (!a.floor.endsWith("F")) return;
        floorNumber = Number(a.floor.replace("F", ""));
      }

      // 그룹 범위 안에 포함되면 카운트
      if (floorNumber >= group.start && floorNumber <= group.end) {
        if (a.level === "warning") warning++;
        if (a.level === "caution") caution++;
      }
    });

    // -------------------------
    // ② 요청(requests) 카운트
    // -------------------------
    requestList.forEach((r) => {
      if (!r.floor) return;

      let floorNumber = 0;

      if (group.type === "basement") {
        if (!r.floor.startsWith("B")) return;
        floorNumber = Number(r.floor.replace("B", ""));
      } else {
        if (!r.floor.endsWith("F")) return;
        floorNumber = Number(r.floor.replace("F", ""));
      }

      if (floorNumber >= group.start && floorNumber <= group.end) {
        requests++;
      }
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
                          <img src={Warning} alt="경고" className="w-[50px] h-[50px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                            font-pyeojin text-[28px] text-[#054E76]"
                            >{warning}</p>
                        </div>
                        )}
                        {/* 주의 */}
                        {caution >= 0 && (
                        <div className="relative">
                          <img src={Caution} alt="주의" className="w-[50px] h-[50px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                            font-pyeojin text-[28px] text-[#054E76]"
                            >{caution}</p>
                        </div>
                        )}
                        {/* 요청 */}
                        {requests >= 0 && (
                        <div className="relative">
                          <img src={Circle} alt="요청" className="w-[45px] h-[45px] relative"/>
                          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                            font-pyeojin text-[28px] text-[#054E76]"
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