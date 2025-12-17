// src/pages/MainPage.jsx
import AdminLayout from "../layout/AdminLayout";
import MainBuilding from "../components/main/MainBuilding";
import MainPark from "../components/main/MainPark";

import { useEffect, useState } from "react";
import { rtdb } from "../firebase/config";
import { ref, get } from "firebase/database";
import { NavLink } from "react-router-dom";

export default function MainPage() {
  const [floorGroups, setFloorGroups] = useState([]);
  const [buildingName, setBuildingName] = useState("");

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const buildingId = "43c82c19-bf2a-4068-9776-dbb0edaa9cc0";
        const snapshot = await get(ref(rtdb, `buildings/${buildingId}`));
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        setBuildingName(data?.name || "");

        // ✅ 지하/지상 기준을 up/down으로 잡기
        const basement = Number(data?.down ?? 0) || 0; // B1~B{down}
        const groundFloors = Number(data?.up ?? data?.floors ?? 0) || 0; // 1F~up (up 없으면 floors fallback)

        // 지하 그룹(한 덩어리)
        const basementGroup =
          basement > 0 ? [{ type: "basement", start: 1, end: basement }] : [];

        // 지상 그룹(10층 단위)
        const groundGroupCount = Math.ceil(groundFloors / 10);
        const groundGroups = Array.from(
          { length: groundGroupCount },
          (_, i) => ({
            type: "ground",
            start: i * 10 + 1,
            end: Math.min((i + 1) * 10, groundFloors),
          })
        );

        // 위쪽(고층)부터 보이게 reverse
        setFloorGroups([...groundGroups.reverse(), ...basementGroup]);
      } catch (e) {
        console.error("fetchBuilding error:", e);
      }
    };

    fetchBuilding();
  }, []);

  const baseTabClass = "hover:text-[#054E76] transition-colors";
  const activeTabClass = "text-[#054E76] font-bold";
  const inactiveTabClass = "text-gray-600";

  return (
    <div className="bg-[url('./assets/imgs/background.png')] bg-cover bg-center h-screen">
      <AdminLayout logoSize="w-[290px] h-[113px]" floorGroups={floorGroups} />

      <div>
        {/* ✅ Data 페이지 라우트로 매핑 */}
        <ul
          className="w-[394px] flex justify-between font-pyeojin text-[28px]
          absolute top-[81px] left-1/2 -translate-x-1/2"
        >
          <li>
            <NavLink
              to="/data/elecData"
              className={({ isActive }) =>
                `${baseTabClass} ${
                  isActive ? activeTabClass : inactiveTabClass
                }`
              }
            >
              전력
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/data/tempData"
              className={({ isActive }) =>
                `${baseTabClass} ${
                  isActive ? activeTabClass : inactiveTabClass
                }`
              }
            >
              온도
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/data/waterData"
              className={({ isActive }) =>
                `${baseTabClass} ${
                  isActive ? activeTabClass : inactiveTabClass
                }`
              }
            >
              수도
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/data/gasData"
              className={({ isActive }) =>
                `${baseTabClass} ${
                  isActive ? activeTabClass : inactiveTabClass
                }`
              }
            >
              가스
            </NavLink>
          </li>
        </ul>

        <div className="flex justify-between w-[745px] mx-auto mt-[30px]">
          <MainBuilding floorGroups={floorGroups} buildingName={buildingName} />
          <MainPark />
        </div>
      </div>
    </div>
  );
}
