// src/components/main/MainPark.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/config";
import { ref, get, onValue } from "firebase/database";

import Park from "../../assets/imgs/park.png";
import Vacant from "../../assets/icons/green.png";

function getTypeLabel(type) {
  if (type === "tower") return "주차타워";
  if (type === "flat") return "주차장";
  return "주차";
}

// ✅ "주차장 12" 같은 이름/lotId에서 마지막 숫자 뽑기
function extractLastNumber(value) {
  const s = String(value ?? "");
  const m = s.match(/(\d+)(?!.*\d)/);
  return m ? Number(m[1]) : null;
}

function getSortKey(cfg) {
  // 1) order 필드가 있으면 그걸로 정렬 (DB에 만들어두면 제일 깔끔)
  const order = Number(cfg?.order);
  if (Number.isFinite(order)) return { kind: 0, num: order, str: "" };

  // 2) name 마지막 숫자
  const n1 = extractLastNumber(cfg?.name);
  if (Number.isFinite(n1)) return { kind: 1, num: n1, str: "" };

  // 3) lotId 마지막 숫자
  const n2 = extractLastNumber(cfg?.lotId);
  if (Number.isFinite(n2)) return { kind: 2, num: n2, str: "" };

  // 4) 문자열 fallback
  const str = String(cfg?.name ?? cfg?.lotId ?? "");
  return { kind: 3, num: Number.MAX_SAFE_INTEGER, str };
}

export default function MainPark() {
  const [lotConfigs, setLotConfigs] = useState([]); // 모든 주차장 config 목록
  const [emptyByLot, setEmptyByLot] = useState({}); // { [lotId]: emptySlots }

  const navigate = useNavigate();

  // 1) 주차장 목록(설정) 가져오기
  useEffect(() => {
    const loadSimConfig = async () => {
      const simSnap = await get(ref(rtdb, "parkingSimConfig"));
      if (!simSnap.exists()) {
        setLotConfigs([]);
        return;
      }

      const simRaw = simSnap.val();
      const configs = Object.keys(simRaw).map((key) => ({
        lotId: key,
        ...simRaw[key],
      }));

      // ✅ 타입 우선 제거하고, 번호(또는 order) 기준 정렬로 변경
      configs.sort((a, b) => {
        const ka = getSortKey(a);
        const kb = getSortKey(b);

        // kind 먼저 (order -> name숫자 -> lotId숫자 -> 문자열)
        if (ka.kind !== kb.kind) return ka.kind - kb.kind;

        // 숫자 비교
        if (ka.num !== kb.num) return kb.num - ka.num;

        // 문자열 비교
        return ka.str.localeCompare(kb.str);
      });

      setLotConfigs(configs);
    };

    loadSimConfig();
  }, []);

  // 2) 실시간(빈자리) 구독해서 lotId별로 emptySlots 계산
  useEffect(() => {
    if (lotConfigs.length === 0) {
      setEmptyByLot({});
      return;
    }

    const realtimeRef = ref(rtdb, "parkingRealtime");
    const unsubscribe = onValue(realtimeRef, (snap) => {
      const realRaw = snap.val() || {};
      const nextMap = {};

      lotConfigs.forEach((cfg) => {
        const lotId = cfg.lotId;
        const match = realRaw[lotId];
        const empty = Number(match?.meta?.emptySlots ?? match?.emptySlots ?? 0);
        nextMap[lotId] = Number.isFinite(empty) ? empty : 0;
      });

      setEmptyByLot(nextMap);
    });

    return () => unsubscribe();
  }, [lotConfigs]);

  // 3) 화면에 뿌릴 섹션(로트별)
  const sections = useMemo(() => {
    return lotConfigs.map((cfg) => ({
      lotId: cfg.lotId,
      type: cfg.type,
      label: cfg.name || getTypeLabel(cfg.type),
      empty: emptyByLot[cfg.lotId] ?? null,
    }));
  }, [lotConfigs, emptyByLot]);

  const boxCount = sections.length;
  const boxHeight = boxCount > 0 ? 665 / boxCount : 0;

  const handleClickLot = (lotId) => {
    if (!lotId) return;
    navigate(`/parking/${lotId}`);
  };

  return (
    <div
      style={{ backgroundImage: `url(${Park})` }}
      className="w-[350px] h-[665px] bg-cover bg-center relative"
    >
      {/* 주차 박스(로트별) */}
      {sections.map((sec, index) => (
        <div
          key={sec.lotId || index}
          className="font-pyeojin hover:bg-[#054E76]/50 group relative z-10 cursor-pointer"
          style={{ height: `${boxHeight}px` }}
          onClick={() => handleClickLot(sec.lotId)}
        >
          <div
            className="w-[220px] h-[44px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              flex justify-around items-center bg-white rounded-[10px]"
          >
            <div className="relative flex justify-around items-center">
              <img
                src={Vacant}
                alt={`${sec.label} 빈 자리`}
                className="w-[37px] h-[37px]"
              />
              <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-pyeojin text-[20px]">
                {sec.empty === null ? "-" : sec.empty}
              </p>
            </div>

            <div className="flex flex-col items-start leading-none">
              <p className="text-[22px] font-pyeojin">{sec.label}</p>
              <p className="text-[14px] text-gray-500">
                {getTypeLabel(sec.type)}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div
        className="bg-white rounded-[10px] absolute bottom-[10px] left-1/2 -translate-x-1/2
          w-[100px] h-[32px] font-pyeojin text-[24px] text-center"
      >
        주차현황
      </div>
    </div>
  );
}
