// MainPage
import AdminLayout from "../layout/AdminLayout";
import MainBuilding from "../components/main/MainBuilding";
import MainPark from "../components/main/MainPark";

import { useEffect, useState } from "react";
import { rtdb } from "../firebase/config";
import { ref, get } from "firebase/database";

export default function MainPage() {
  const [floorGroups, setFloorGroups] = useState([]);
  const [buildingName, setBuildingName] = useState("");

  useEffect(() => {
    const fetchBuilding = async () => {
      const snapshot = await get(
        ref(rtdb, "buildings/43c82c19-bf2a-4068-9776-dbb0edaa9cc0")
      );
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      setBuildingName(data.name);
      
      const totalFloors = Number(data.floors);
        const basement = Number(data.down);
        const groundFloors = totalFloors - basement;

        const basementGroup =
        basement > 0
            ? [{ type: "basement", start: 1, end: basement }]
            : [];

        const groundGroupCount = Math.ceil(groundFloors / 10);
        const groundGroups = Array.from(
        { length: groundGroupCount },
        (_, i) => ({
            type: "ground",
            start: i * 10 + 1,
            end: Math.min((i + 1) * 10, groundFloors),
        })
        );

        setFloorGroups([...groundGroups.reverse(), ...basementGroup]);
    };

    fetchBuilding();
    }, []);

    return(
        // 배경화면
        <div className="bg-[url('./assets/imgs/background.png')] bg-cover bg-center h-screen">
            {/* 스킨과 로고변경 */}
            <AdminLayout
                logoSize="w-[290px] h-[113px]"
                floorGroups={floorGroups}/>
            {/* 건물 */}
            <div>
                <ul className="w-[394px] flex justify-between font-pyeojin text-[28px]
                    absolute top-[81px] left-1/2 -translate-x-1/2 cursor-pointer">
                    <li className="hover:text-[#054E76]">전력</li>
                    <li className="hover:text-[#054E76]">온도</li>
                    <li className="hover:text-[#054E76]">수도</li>
                    <li className="hover:text-[#054E76]">가스</li>
                </ul>
                <div className="flex justify-between w-[745px] mx-auto mt-[30px]">
                    <MainBuilding floorGroups={floorGroups}
                        buildingName={buildingName}/>
                    <MainPark/>
                </div>
            </div>
        </div>
    );
}