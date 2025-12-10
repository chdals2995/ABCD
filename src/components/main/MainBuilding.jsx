import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, get } from "firebase/database";
import Building from "../../assets/imgs/building.png";

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
      const finalGroups = [...groundGroups, ...basementGroup].reverse();

      setFloorGroups(finalGroups);

      // 🔥 alerts & requests 저장
      if (alertsSnapshot.exists()) setAlertList(Object.values(alertsSnapshot.val()));
      if (reqSnapshot.exists()) setRequestList(Object.values(reqSnapshot.val()));
    };
      
    fetchBuilding();
  }, []);


//   아이콘
  const getGroupCounts = (group) => {
    let warning = 0; // 경고
    let caution = 0; // 주의
    let request = 0; // 요청

    // -------------------------
    // ① 경고(alerts) 카운트
    // -------------------------
    alertList.forEach((a) => {
      if (!a.floor) return;

      let floorNumber = 0;

      if (group.type === "basement") {
        // 지하층: floor = "B3" 이런 형식
        if (a.floor.startsWith("B")) {
          floorNumber = Number(a.floor.replace("B", ""));
        } else return;
      } else {
        // 지상층: "12F" → 12
        if (a.floor.endsWith("F")) {
          floorNumber = Number(a.floor.replace("F", ""));
        } else return;
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
        if (r.floor.startsWith("B")) {
          floorNumber = Number(r.floor.replace("B", ""));
        } else return;
      } else {
        if (r.floor.endsWith("F")) {
          floorNumber = Number(r.floor.replace("F", ""));
        } else return;
      }

      if (floorNumber >= group.start && floorNumber <= group.end) {
        request++;
      }
    });

    return { caution, warning, request };
  };


    return(
        // 건물
        <div style={{ backgroundImage: `url(${Building})` }}
        className="w-[350px] h-[665px] bg-cover bg-center relative">
            {/* 층분할 */}
            {floorGroups.map((group) => (
                <div
                    key={`${group.type}-${group.start}-${group.end}`}
                    className="border hover:bg-[#054E76]/50 group relative z-2"
                    style={{ height: `${665/floorGroups.length}px`}}
                >
                    {/* 층수표시 */}
                    <div className="font-pyeojin group-hover:text-white ml-[10px] mt-[10px]">
                        {/* 지하 */}
                        {group.type === "basement"
                        ? `${group.labelStart}층 ~ ${group.labelEnd}층`
                        : `${group.start}층 ~ ${group.end}층`}
                    </div>
                    {/* 아이콘 표시 */}
                    <div>
                        {/* 경고 */}
                        <div>

                        </div>
                        {/* 주의 */}
                        <div>

                        </div>
                        {/* 요청 */}
                        <div>

                        </div>
                    </div>
                </div>
            ))}
            {/* 건물 이름 */}
            <div className="bg-white rounded-[10px] absolute bottom-[18px] left-1/2 -translate-x-1/2
                w-[130px] h-[44px]
                font-pyeojin text-[32px] text-center">
                {buildingName}
            </div>
        </div>
    );
}