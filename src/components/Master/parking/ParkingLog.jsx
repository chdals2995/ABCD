// src/components/Master/parking/ParkingLog.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue, remove } from "firebase/database";
import ParkingEdit from "./ParkingEdit";
import redtrash from "../../../assets/icons/redtrash.png";

function extractLastNumber(value) {
  const s = String(value ?? "");
  const m = s.match(/(\d+)(?!.*\d)/);
  return m ? Number(m[1]) : null;
}

function getTypeLabel(type) {
  if (type === "tower") return "주차타워";
  if (type === "flat") return "주차장";
  return "-";
}

export default function ParkingLog() {
  const [log, setLog] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const openModal = (p) => {
    setSelected(p);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  // 삭제
  const handleDeleteParking = (e, id) => {
  e.stopPropagation(); // li 클릭 → 모달 열리는 거 방지

  if (!confirm("해당 주차장을 삭제하시겠습니까?")) return;

  const parkingRef = ref(rtdb, `parkingSimConfig/${id}`);
  remove(parkingRef);
};

  useEffect(() => {
    const cfgRef = ref(rtdb, "parkingSimConfig");

    return onValue(cfgRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setLog([]);
        return;
      }

      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      list.sort((a, b) => {
        const an = extractLastNumber(a.id) ?? 999999;
        const bn = extractLastNumber(b.id) ?? 999999;
        if (an !== bn) return an - bn;
        return String(a.id).localeCompare(String(b.id));
      });

      setLog(list);
    });
  }, []);

  return (
    <>
      <div
        className="w-[372px] h-[885px] px-[27px] bg-[#E7F3F8] border-[#0888D4]
          absolute right-0 top-[68px] pt-[30px] pl-[27px]"
      >
        <p className="text-[24px] font-pyeojin">주차장 등록 내역</p>

        <div className="w-[318px] h-[600px] bg-white m-auto mt-[30px] px-[14px] pt-[7px] overflow-y-auto">
          <ul>
            {log.map((p) => (
              <li
                key={p.id}
                onClick={() => openModal(p)}
                className="group text-[18px] mt-[10px] cursor-pointer border-b-[2px] border-transparent 
                  hover:border-b-[2px] hover:border-b-[#054E76] hover:font-bold "
              >
                <div className="flex justify-between">
                  {p.name} ({p.id})
                <button
                  onClick={(e)=>handleDeleteParking(e, p.id)}
                  className="opacity-0 group-hover:opacity-100 cursor-pointer">
                  <img src={redtrash} alt="삭제" />
                </button>
                </div>
                <div className="flex justify-between">
                  <div className="text-[14px] text-gray-500">
                    소속 건물 명: {p.belongsto || "-"}
                  </div>
                  <div className="text-[14px] text-gray-500">
                    타입: {getTypeLabel(p.type)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ParkingEdit parking={selected} open={open} close={closeModal} />
    </>
  );
}
