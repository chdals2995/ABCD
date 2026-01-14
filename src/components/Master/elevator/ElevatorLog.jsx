import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue, remove } from "firebase/database";
import ElevatorEdit from "./ElevatorEdit";
import redtrash from "../../../assets/icons/redtrash.png";

export default function ElevatorLog(){

    const [Log, setLog] = useState([]);
  const [selectedElev, setSelectedElev] = useState(null);
  const [open, setOpen] = useState(false);

  const openElevatorModal = (elevator) => {
    setSelectedElev(elevator);
    setOpen(true);
  };

  const closeElevatorModal = () => {
    setOpen(false);
    setSelectedElev(null);
  };

//  삭제
  const handleDeleteElevator = (e, id) => {
  e.stopPropagation(); // li 클릭 → 수정 모달 열리는 것 방지

  if (!confirm("해당 승강기를 삭제하시겠습니까?")) return;

  const elevatorRef = ref(rtdb, `elevators/${id}`);
  remove(elevatorRef);
};


  useEffect(() => {
    const elevatorsRef = ref(rtdb,"elevators");

    return onValue(elevatorsRef, (snapshot) => {
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
                <p className="text-[24px] font-pyeojin">승강기 등록 내역</p>
                <div className="w-[318px] h-[600px] bg-white m-auto mt-[30px] px-[14px] pt-[7px]">
                    <ul>
                        {Log.map((elevator) => (
                        <li
                            key={elevator.id}
                            onClick={() => openElevatorModal(elevator)}
                            className="group text-[18px] mt-[10px] cursor-pointer border-b-[2px] border-transparent 
                            hover:border-b-[2px] hover:border-b-[#054E76] hover:font-bold flex justify-between"
                        >
                            {elevator.name}
                            <button
                            onClick={(e)=>handleDeleteElevator(e, elevator.id)}
                            className="opacity-0 group-hover:opacity-100 cursor-pointer">
                                <img src={redtrash} alt="삭제" />
                            </button>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* 건물 수정 모달창 */}
            <ElevatorEdit elevator={selectedElev} open={open} close={closeElevatorModal} />
        </>
    );
}