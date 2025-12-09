// src/pages/Floors.jsx
import { useEffect, useState } from "react";

import FloorsElecData from "../components/floors/FloorsElecData";
import FloorsGasData from "../components/floors/FloorsGasData";
import FloorsTempData from "../components/floors/FloorsTempData";
import FloorsWaterData from "../components/floors/FloorsWaterData";
import AdminLayout from "../layout/AdminLayout";
import Floor from "../components/floors/Floor";

// 화살표 아이콘
import upArrow from "../assets/icons/upArrow.png";
import downArrow from "../assets/icons/downArrow.png";

import { rtdb } from "../firebase/config";
import { ref, get } from "firebase/database";

// 🔹 up/down 값으로 10개씩 끊어서 그룹 만들기
//   up = "20", down = "3"  =>
//   groups = [
//     ["B1","B2","B3"],        // 지하 (내려가기 버튼으로 가야 하는 그룹)
//     ["10F","9F",...,"1F"],   // 1~10층
//     ["20F","19F",...,"11F"]  // 11~20층
//   ]
function buildFloorGroups(upCount, downCount) {
  const GROUP_SIZE = 10;
  const up = Number(upCount) || 0;
  const down = Number(downCount) || 0;

  // 지상층 1F ~ upF
  const upFloors = [];
  for (let f = 1; f <= up; f++) {
    upFloors.push(`${f}F`);
  }

  // 10층씩 끊어서, 한 그룹 안에서는 높은 층이 위(배열 앞)에 오도록 reverse
  const upGroups = [];
  for (let i = 0; i < upFloors.length; i += GROUP_SIZE) {
    const slice = upFloors.slice(i, i + GROUP_SIZE).reverse();
    upGroups.push(slice);
  }

  const groups = [];

  // 지하층 B1 ~ B{down} (있으면 첫 번째 그룹으로 넣기)
  if (down > 0) {
    const basementFloors = [];
    for (let b = 1; b <= down; b++) {
      basementFloors.push(`B${b}`);
    }
    groups.push(basementFloors);
  }

  // 그 다음에 지상 그룹들 추가
  groups.push(...upGroups);

  return groups;
}

export default function Floors() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [floorGroups, setFloorGroups] = useState([]);
  const [buildingName, setBuildingName] = useState("");

  // 🔹 RTDB buildings에서 up/down 읽어서 그룹 생성
  useEffect(() => {
    let isMounted = true;

    async function loadBuildingFloors() {
      try {
        const snap = await get(ref(rtdb, "buildings"));
        if (!snap.exists()) {
          if (!isMounted) return;
          // fallback: 20층, 지하 0층
          setFloorGroups(buildFloorGroups(20, 0));
          return;
        }

        const data = snap.val() || {};
        const ids = Object.keys(data);
        if (!ids.length) {
          if (!isMounted) return;
          setFloorGroups(buildFloorGroups(20, 0));
          return;
        }

        // 일단 첫 번째 건물 기준
        const firstId = ids[0];
        const building = data[firstId] || {};
        const up = Number(building.up || building.floors || 0);
        const down = Number(building.down || 0);

        const groups = buildFloorGroups(up, down);

        if (!isMounted) return;
        setBuildingName(building.name || "");
        setFloorGroups(groups);
      } catch (err) {
        console.error("Floors: buildings 정보 로드 실패:", err);
        if (!isMounted) return;
        setFloorGroups(buildFloorGroups(20, 0));
      }
    }

    loadBuildingFloors();
    return () => {
      isMounted = false;
    };
  }, []);

  // 🔹 floorGroups가 준비되면 "1F가 포함된 그룹"을 초기 그룹으로 선택
  useEffect(() => {
    if (!floorGroups.length) return;

    const idxWith1F = floorGroups.findIndex(
      (grp) => Array.isArray(grp) && grp.includes("1F")
    );

    setGroupIndex(idxWith1F === -1 ? 0 : idxWith1F);
  }, [floorGroups]);

  const currentFloors = floorGroups[groupIndex] || [];
  const rows = Array.from({ length: 10 }, (_, i) => currentFloors[i] ?? null);

  const canGoUp = groupIndex < floorGroups.length - 1; // 위(더 높은 층)로
  const canGoDown = groupIndex > 0; // 아래(지하쪽)로

  const handleUp = () => {
    if (!canGoUp) return;
    setGroupIndex((prev) => prev + 1);
  };

  const handleDown = () => {
    if (!canGoDown) return;
    setGroupIndex((prev) => prev - 1);
  };

  return (
    <div className="relative h-screen w-screen">
      {/* 👉 뒤 배경 (좌/우 패널만) */}
      <div className="absolute inset-0 flex z-0">
        {/* 왼쪽 패널 */}
        <div className="w-[554px] bg-[#E7F3F8] relative">
          <div className="absolute w-[411px] right-[47px] top-[170px] flex flex-col gap-[47px]">
            <FloorsElecData />
            <FloorsTempData />
          </div>
        </div>

        {/* 중앙은 배경만 — 실제 빌딩/화살표는 위 레이어에서 겹침 */}
        <div className="flex-1" />

        {/* 오른쪽 패널 */}
        <div className="w-[554px] bg-[#E7F3F8] relative">
          <div className="absolute w-[411px] left-[47px] top-[170px] flex flex-col gap-[47px]">
            <FloorsWaterData />
            <FloorsGasData />
          </div>
        </div>
      </div>

      {/* 👉 Admin 레이아웃 (메뉴/탑바) */}
      <div className="relative z-10">
        <AdminLayout />
      </div>

      {/* 👉 중앙 빌딩 + 위/아래 화살표 (레이아웃 위, 클릭 가능) */}
      <div className="absolute inset-0 flex z-20 pointer-events-none">
        {/* 왼쪽 여백 */}
        <div className="w-[554px]" />

        {/* 중앙 영역 */}
        <div className="flex-1 flex justify-center items-end">
          {/* 이 블록만 클릭되도록 pointer-events-auto */}
          <div className="flex flex-col items-center gap-[8px] mb-[95px] pointer-events-auto">
            {buildingName && (
              <div className="mb-1 text-xs text-[#054E76] font-semibold">
                {buildingName}
              </div>
            )}

            {/* ⬆ 위 아이콘 (위층 보기) */}
            <button
              type="button"
              onClick={handleUp}
              disabled={!canGoUp}
              className={`p-0 bg-transparent ${
                canGoUp ? "cursor-pointer" : "opacity-30 cursor-default"
              }`}
            >
              <img
                src={upArrow}
                alt="위층 보기"
                className="w-[70px] h-[33px]"
              />
            </button>

            {/* 🟦 회색 패널 안에 10층 빌딩 */}
            <div className="w-[483px] px-[16px] pb-[34px] pt-[18px] bg-[#DBE0E4] floorContainer">
              <div className="w-[453px] mx-auto gap-[9px] flex flex-col">
                {rows.map((floorName, idx) => (
                  <div key={idx} className="h-[63px] px-[16px] relative">
                    {floorName && <Floor floor={floorName} />}
                  </div>
                ))}
              </div>
            </div>

            {/* ⬇ 아래 아이콘 (지하/아래층 보기) */}
            <button
              type="button"
              onClick={handleDown}
              disabled={!canGoDown}
              className={`p-0 bg-transparent ${
                canGoDown ? "cursor-pointer" : "opacity-30 cursor-default"
              }`}
            >
              <img
                src={downArrow}
                alt="아래층 보기"
                className="w-[70px] h-[33px]"
              />
            </button>
          </div>
        </div>

        {/* 오른쪽 여백 */}
        <div className="w-[554px]" />
      </div>
    </div>
  );
}
