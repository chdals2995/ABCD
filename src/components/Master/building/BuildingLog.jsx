import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue, remove } from "firebase/database";
import BuildingEdit from "./BuildingEdit";
import redtrash from "../../../assets/icons/redtrash.png";

export default function BuildingLog(){

    const [Log, setLog] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [open, setOpen] = useState(false);

  const openBuildingModal = (building) => {
    setSelectedBuilding(building);
    setOpen(true);
  };

  const closeBuildingModal = () => {
    setOpen(false);
    setSelectedBuilding(null);
  };

// 삭제
  const handleDeleteBuilding = (e, id) => {
    e.stopPropagation(); // li 클릭(모달 열기) 막기

    if (!confirm("해당 건물을 삭제하시겠습니까?")) return;

    const buildingRef = ref(rtdb, `buildings/${id}`);
    remove(buildingRef);
    };

  useEffect(() => {
    const buildingsRef = ref(rtdb,"buildings");

    return onValue(buildingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const list = Object.entries(data).map(([id, value]) => ({id,...value,}));

      setLog(list);
    });
  }, []);

    return(
        <>
            <div
            className="w-[372px] h-[885px] px-[27px] bg-[#E7F3F8] border-[#0888D4]
                    absolute right-0 top-[68px] pt-[30px] pl-[27px]"
            >
                <p className="text-[24px] font-pyeojin">건물 등록 내역</p>
                <div className="w-[318px] h-[600px] bg-white m-auto mt-[30px] px-[14px] pt-[7px]">
                    <ul>
                        {Log.map((building) => (
                        <li
                            key={building.id}
                            onClick={() => openBuildingModal(building)}
                            className="group text-[18px] mt-[10px] cursor-pointer border-b-[2px] border-transparent 
                            hover:border-b-[2px] hover:border-b-[#054E76] hover:font-bold flex justify-between"
                        >
                            {building.name}
                            <button
                            onClick={(e)=>handleDeleteBuilding(e,building.id)}
                            className="opacity-0 group-hover:opacity-100 cursor-pointer">
                                <img src={redtrash} alt="삭제" />
                            </button>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* 건물 수정 모달창 */}
            <BuildingEdit building={selectedBuilding} open={open} close={closeBuildingModal} />
        </>
    );
}