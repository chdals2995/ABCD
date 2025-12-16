// src/components/main/MainPark.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/config";
import { ref, get ,onValue} from "firebase/database";

import Park from "../../assets/imgs/park.png";
import Vacant from "../../assets/icons/green.png";

export default function MainPark() {
  const [towerEmpty, setTowerEmpty] = useState(null);
  const [flatEmpty, setFlatEmpty] = useState(null);

  const [towerLotId, setTowerLotId] = useState(null);
  const [flatLotId, setFlatLotId] = useState(null);

  const [towerConfigs, setTowerConfigs] = useState([]);
  const [flatConfigs, setFlatConfigs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
  const loadSimConfig = async () => {
    const simSnap = await get(ref(rtdb, "parkingSimConfig"));
    if (!simSnap.exists()) return;

    const simRaw = simSnap.val();
    const simConfigs = Object.keys(simRaw).map((key) => ({
      lotId: key,
      ...simRaw[key],
    }));

    const towers = simConfigs.filter((c) => c.type === "tower");
    const flats = simConfigs.filter((c) => c.type === "flat");

  setTowerConfigs(towers);
  setFlatConfigs(flats);

    if (towerConfigs.length > 0) setTowerLotId(towers[0].lotId);
    if (flatConfigs.length > 0) setFlatLotId(flats[0].lotId);
  };

  loadSimConfig();
  }, []);

  useEffect(() => {
  if (towerConfigs.length === 0 && flatConfigs.length === 0) return;

  const realtimeRef = ref(rtdb, "parkingRealtime");
  const unsubscribe = onValue(realtimeRef, (snap) => {
    if (!snap.exists()) return;

    const realRaw = snap.val();
    const realtime = Object.keys(realRaw).map((key) => ({
      lotId: key,
      ...realRaw[key],
    }));

    let towerEmptySum = 0;
    let flatEmptySum = 0;

    towerConfigs.forEach((tc) => {
      const match = realtime.find((r) => r.lotId === tc.lotId);
      if (match) {
        towerEmptySum += Number(match.meta?.emptySlots ?? match.emptySlots ?? 0);
      }
    });

    flatConfigs.forEach((fc) => {
      const match = realtime.find((r) => r.lotId === fc.lotId);
      if (match) {
        flatEmptySum += Number(match.meta?.emptySlots ?? match.emptySlots ?? 0);
      }
    });

    setTowerEmpty(towerEmptySum);
    setFlatEmpty(flatEmptySum);
  });

  return () => unsubscribe();
}, [towerConfigs, flatConfigs]);


  // 박스 개수 계산
  const sections = [];
  if (towerEmpty !== null) {
    sections.push({
      type: "tower",
      label: "주차타워",
      empty: towerEmpty,
    });
  }
  if (flatEmpty !== null) {
    sections.push({
      type: "flat",
      label: "주차장",
      empty: flatEmpty,
    });
  }

  const boxCount = sections.length;
  const boxHeight = boxCount > 0 ? 665 / boxCount : 0;

  const handleClickSection = (type) => {
    if (type === "tower" && towerLotId) {
      navigate(`/parking/${towerLotId}`);
    } else if (type === "flat" && flatLotId) {
      navigate(`/parking/${flatLotId}`);
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${Park})` }}
      className="w-[350px] h-[665px] bg-cover bg-center relative"
    >
      {/* 주차 박스 */}
      {sections.map((sec, index) => (
        <div
          key={index}
          className="font-pyeojin hover:bg-[#054E76]/50 group relative z-10 cursor-pointer"
          style={{ height: `${boxHeight}px` }}
          onClick={() => handleClickSection(sec.type)}
        >
          {/* 아이콘과 이름 */}
          {sec.empty !== null && (
            <div
              className="w-[148px] h-[44px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    flex justify-around items-center bg-white rounded-[10px]"
            >
              <div className="relative flex justify-around items-center">
                <img
                  src={Vacant}
                  alt={`${sec.label} 빈 자리`}
                  className="w-[37px] h-[37px]"
                />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-pyeojin text-[20px]">
                  {sec.empty}
                </p>
              </div>
              <p className="text-[24px] font-pyeojin">{sec.label}</p>
            </div>
          )}
        </div>
      ))}

      {/* 주차 이름 */}
      <div
        className="bg-white rounded-[10px] absolute bottom-[10px] left-1/2 -translate-x-1/2
                w-[100px] h-[32px] font-pyeojin text-[24px] text-center"
      >
        주차현황
      </div>
    </div>
  );
}
