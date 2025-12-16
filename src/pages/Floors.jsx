// src/pages/Floors.jsx
import { useEffect, useState, useMemo } from "react";
<<<<<<< HEAD
=======
import { useLocation, useNavigate } from "react-router-dom";
>>>>>>> 63f49d55d9f45815223007293574a8ec0f919564

import FloorsElecData from "../components/floors/FloorsElecData";
import FloorsGasData from "../components/floors/FloorsGasData";
import FloorsTempData from "../components/floors/FloorsTempData";
import FloorsWaterData from "../components/floors/FloorsWaterData";
import SelectedFloorElecData from "../components/floors/SelectedFloorElecData";
import SelectedFloorGasData from "../components/floors/SelectedFloorGasData";
import SelectedFloorTempData from "../components/floors/SelectedFloorTempData";
import SelectedFloorWaterData from "../components/floors/SelectedFloorWaterData";
import ProblemList from "../components/floors/ProblemList";

import AdminLayout from "../layout/AdminLayout";
import Floor from "../components/floors/Floor";

// 화살표 아이콘
import upArrow from "../assets/icons/upArrow.png";
import downArrow from "../assets/icons/downArrow.png";

// 아이콘 설명용
import alertIcon from "../assets/icons/alert.png"; // 노란 삼각형
import warningIcon from "../assets/icons/iconRed.png"; // 빨간 삼각형
import questionIcon from "../assets/icons/iconQuestion.png"; // 파란 원

import { rtdb } from "../firebase/config";
import { ref, get } from "firebase/database";

// ✅ 주차장 lotId 찾을 경로 후보(프로젝트 DB에 맞게 필요하면 수정)
const PARKING_PATH_CANDIDATES = ["parkingLots", "parkingRealtime", "parking"];

// ✅ RTDB 경로에서 "첫 번째 키" 가져오기
async function getFirstKeyFromPath(path) {
  const snap = await get(ref(rtdb, path));
  if (!snap.exists()) return null;

  const val = snap.val();
  if (!val) return null;

  // object 형태: { lotId1: {...}, lotId2: {...} }
  if (typeof val === "object" && !Array.isArray(val)) {
    const keys = Object.keys(val);
    if (!keys.length) return null;
    keys.sort(); // "첫 번째"를 안정적으로(키 기준) 고정
    return keys[0];
  }

  // array 형태일 경우(드물지만): [null, {...}, {...}]
  if (Array.isArray(val)) {
    const idx = val.findIndex((x) => x != null);
    if (idx === -1) return null;
    return String(idx);
  }

  return null;
}

// ✅ 여러 경로 후보를 순회하면서 첫 lotId를 찾기
async function findFirstParkingLotId() {
  for (const path of PARKING_PATH_CANDIDATES) {
    try {
      const id = await getFirstKeyFromPath(path);
      if (id) return id;
    } catch (e) {
      // 경로 권한/구조 문제 등은 다음 후보로 넘어감
      console.warn(`parking lotId load failed at path: ${path}`, e);
    }
  }
  return null;
}

// 🔹 up/down 값으로 10개씩 끊어서 그룹 만들기 (빌딩 중앙 10층 스택용)
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

  // 지하층 B1 ~ B{down} (있으면 첫 번째 그룹으로 넣기) — B1이 가장 위에 보이도록
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

// 🔹 그래프용 전체 층 리스트 (B1, B2, ..., 1F, 2F, ...)
function buildAllFloors(upCount, downCount) {
  const up = Number(upCount) || 0;
  const down = Number(downCount) || 0;

  const floors = [];
  for (let b = 1; b <= down; b++) {
    floors.push(`B${b}`);
  }
  for (let f = 1; f <= up; f++) {
    floors.push(`${f}F`);
  }
  return floors;
}

// 🔹 현재 그룹이 몇 층~몇 층인지 텍스트(위/아래 두 줄)로 만들어 주는 함수
function buildGroupRangeLabel(currentFloors) {
  const floors = (currentFloors || []).filter(Boolean);
  if (!floors.length) return null;

  const parsed = floors
    .map((name) => {
      if (typeof name !== "string") return null;

      // 지하: "B3" → { type: "basement", n: 3 }
      if (name.startsWith("B")) {
        const n = parseInt(name.slice(1), 10);
        if (!Number.isFinite(n)) return null;
        return { type: "basement", n };
      }

      // 지상: "10F" → { type: "ground", n: 10 }
      const n = parseInt(name.replace(/[^0-9]/g, ""), 10);
      if (!Number.isFinite(n)) return null;
      return { type: "ground", n };
    })
    .filter(Boolean);

  if (!parsed.length) return null;

  const type = parsed[0].type;
  const nums = parsed.filter((p) => p.type === type).map((p) => p.n);
  const min = Math.min(...nums);
  const max = Math.max(...nums);

  // 위 줄 / 아래 줄
  if (type === "ground") {
    const top = min === max ? `${min}층` : `${min}층-${max}층`;
    return { top, bottom: "종합 데이터" };
  }

  // basement
  const top = min === max ? `지하 ${min}층` : `지하 ${min}층-지하 ${max}층`;
  return { top, bottom: "종합 데이터" };
}

// 🔹 선택된 단일 층 텍스트
function buildSelectedFloorLabel(floorName) {
  if (!floorName || typeof floorName !== "string") return "";

  if (floorName.startsWith("B")) {
    const n = parseInt(floorName.slice(1), 10);
    if (!Number.isFinite(n)) return `${floorName} 데이터`;
    return `지하 ${n}층 데이터`;
  }

  const n = parseInt(floorName.replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(n)) return `${floorName} 데이터`;
  return `${n}층 데이터`;
}

export default function Floors() {
<<<<<<< HEAD
=======
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Main에서 navigate("/floors", { state: { floorTarget } })로 보낸 정보
  const floorTarget = location.state?.floorTarget || null;

>>>>>>> 63f49d55d9f45815223007293574a8ec0f919564
  const [groupIndex, setGroupIndex] = useState(0);
  const [floorGroups, setFloorGroups] = useState([]);
  const [allFloors, setAllFloors] = useState([]); // 🔸 전체 층 리스트 (그래프용)
  const [buildingName, setBuildingName] = useState("");
  const [selectedFloor, setSelectedFloor] = useState(null); // ⬅ 선택된 층

  // 🔸 어떤 그래프를 크게 볼지 ("elec" | "temp" | "water" | "gas" | null)
  const [largeChart, setLargeChart] = useState(null);

  // ✅ 주차장 첫 lotId
  const [firstLotId, setFirstLotId] = useState(null);
  const [parkingLoading, setParkingLoading] = useState(false);

  // 🔹 RTDB buildings에서 up/down 읽어서 그룹 + 전체 층 리스트 생성
  useEffect(() => {
    let isMounted = true;

    async function loadBuildingFloors() {
      try {
        const snap = await get(ref(rtdb, "buildings"));
        if (!snap.exists()) {
          if (!isMounted) return;
          const fallbackGroups = buildFloorGroups(20, 0);
          const fallbackAll = buildAllFloors(20, 0);
          setFloorGroups(fallbackGroups);
          setAllFloors(fallbackAll);
          return;
        }

        const data = snap.val() || {};
        const ids = Object.keys(data);
        if (!ids.length) {
          if (!isMounted) return;
          const fallbackGroups = buildFloorGroups(20, 0);
          const fallbackAll = buildAllFloors(20, 0);
          setFloorGroups(fallbackGroups);
          setAllFloors(fallbackAll);
          return;
        }

        // 일단 첫 번째 건물 기준
        const firstId = ids[0];
        const building = data[firstId] || {};
        const up = Number(building.up || building.floors || 0);
        const down = Number(building.down || 0);

        const groups = buildFloorGroups(up, down);
        const all = buildAllFloors(up, down);

        if (!isMounted) return;
        setBuildingName(building.name || "");
        setFloorGroups(groups);
        setAllFloors(all);
      } catch (err) {
        console.error("Floors: buildings 정보 로드 실패:", err);
        if (!isMounted) return;
        const fallbackGroups = buildFloorGroups(20, 0);
        const fallbackAll = buildAllFloors(20, 0);
        setFloorGroups(fallbackGroups);
        setAllFloors(fallbackAll);
      }
    }

    loadBuildingFloors();
    return () => {
      isMounted = false;
    };
  }, []);

<<<<<<< HEAD
  // 🔹 floorGroups가 준비되면 "1F가 포함된 그룹"을 초기 그룹으로 선택
=======
  // ✅ (선택) 페이지 들어오면 주차장 첫 lotId 미리 로드
  useEffect(() => {
    let isMounted = true;

    async function preloadParkingLot() {
      try {
        const id = await findFirstParkingLotId();
        if (!isMounted) return;
        setFirstLotId(id);
      } catch (e) {
        console.warn("preloadParkingLot failed:", e);
      }
    }

    preloadParkingLot();
    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ 버튼 클릭: 첫 lotId로 이동
  const handleGoParking = async () => {
    if (parkingLoading) return;

    setParkingLoading(true);
    try {
      let lotId = firstLotId;

      if (!lotId) {
        lotId = await findFirstParkingLotId();
        setFirstLotId(lotId);
      }

      if (!lotId) {
        alert("등록된 주차장이 없습니다.");
        return;
      }

      navigate(`/parking/${lotId}`);
    } catch (e) {
      console.error("handleGoParking error:", e);
      alert("주차장 정보를 불러오지 못했습니다.");
    } finally {
      setParkingLoading(false);
    }
  };

  // 🔹 floorGroups가 준비되면
  //    1순위: Main에서 넘어온 floorTarget에 맞는 그룹으로 이동
  //    2순위: 기존처럼 1F가 포함된 그룹으로 이동
>>>>>>> 63f49d55d9f45815223007293574a8ec0f919564
  useEffect(() => {
    if (!floorGroups.length) return;

    const idxWith1F = floorGroups.findIndex(
      (grp) => Array.isArray(grp) && grp.includes("1F")
    );

    setGroupIndex(idxWith1F === -1 ? 0 : idxWith1F);
  }, [floorGroups]);

  const currentFloors = floorGroups[groupIndex] || [];
  const rows = Array.from({ length: 10 }, (_, i) => currentFloors[i] ?? null);

  // 🔹 "1층-10층 / 종합 데이터" 두 줄 텍스트
  const groupRangeLabel = useMemo(
    () => buildGroupRangeLabel(currentFloors),
    [currentFloors]
  );

  // 🔹 그래프용으로는 "전체 층 리스트 순서"를 유지하면서, 현재 그룹에 속한 층만 사용
  const groupFloorsForCharts = useMemo(() => {
    if (!allFloors.length || !currentFloors.length) return [];
    const set = new Set(currentFloors);
    return allFloors.filter((f) => set.has(f));
  }, [allFloors, currentFloors]);

  const canGoUp = groupIndex < floorGroups.length - 1; // 위(더 높은 층)로
  const canGoDown = groupIndex > 0; // 아래(지하쪽)로

  const handleUp = () => {
    if (!canGoUp) return;
    setGroupIndex((prev) => prev + 1);
    setSelectedFloor(null); // 그룹 바꿀 때 선택층 해제
  };

  const handleDown = () => {
    if (!canGoDown) return;
    setGroupIndex((prev) => prev - 1);
    setSelectedFloor(null); // 그룹 바꿀 때 선택층 해제
  };

  // 층 선택 / 해제
  const handleSelectFloor = (floorName) => {
    setSelectedFloor((prev) => (prev === floorName ? null : floorName));
  };

  // 🔸 배경 클릭 시 선택 해제
  const handleBackgroundClick = () => {
    if (selectedFloor) setSelectedFloor(null);
  };

  // 🔸 모달 닫기
  const closeLargeChart = () => setLargeChart(null);

  return (
    <div className="relative h-screen w-screen" onClick={handleBackgroundClick}>
      {/* 👉 뒤 배경 (좌/우 패널만) */}
      <div className="absolute inset-0 flex z-0">
        {/* 왼쪽 패널 */}
        <div className="w-[554px] bg-[#E7F3F8] relative">
          {/* 현재 그룹 범위 라벨 */}
          {!selectedFloor && groupRangeLabel && (
            <div
              className="absolute w-[280px] right-0 top-[100px] flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xl font-bold text-[#054E76] leading-tight text-center">
                <div>{groupRangeLabel.top}</div>
                <div>{groupRangeLabel.bottom}</div>
              </div>
            </div>
          )}

          {/* 선택된 층 라벨 */}
          {selectedFloor && (
            <div
              className="absolute w-[280px] right-0 top-[100px] flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-xl font-bold text-[#054E76] leading-tight text-center">
                {buildSelectedFloorLabel(selectedFloor)}
              </div>
            </div>
          )}

          {/* 🔹 왼쪽 그래프 영역 */}
          <div
            className="absolute w-[411px] right-[47px] top-[170px] flex flex-col gap-[47px]"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFloor ? (
              <>
                <ProblemList floor={selectedFloor} />
                <SelectedFloorElecData floor={selectedFloor} />
                <SelectedFloorTempData floor={selectedFloor} />
              </>
            ) : (
              <>
                <div
                  className="cursor-pointer"
                  onClick={() => setLargeChart("elec")}
                >
                  <FloorsElecData floorIds={groupFloorsForCharts} />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => setLargeChart("temp")}
                >
                  <FloorsTempData floorIds={groupFloorsForCharts} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 중앙은 배경만 */}
        <div className="flex-1" />

        {/* 오른쪽 패널 */}
        <div className="w-[554px] bg-[#E7F3F8] relative">
          {/* ✅ 우측 그래프 위쪽: 주차장 이동 버튼 */}
          <div
            className="absolute w-[411px] left-[47px] top-[120px] flex"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleGoParking}
              disabled={parkingLoading}
              className="px-4 py-2 rounded-[10px] bg-[#054E76] text-white text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              title={
                firstLotId
                  ? `주차장(${firstLotId})로 이동`
                  : "주차장 첫 데이터를 불러와 이동"
              }
            >
              {parkingLoading ? "주차장 불러오는 중..." : "주차장 보기"}
            </button>
          </div>

          {/* 🔹 오른쪽 그래프 영역 */}
          <div
            className={`absolute w-[411px] left-[47px] top-[170px] flex flex-col ${
              selectedFloor ? "gap-[74px]" : "gap-[47px]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFloor ? (
              <>
                <SelectedFloorWaterData floor={selectedFloor} />
                <SelectedFloorGasData floor={selectedFloor} />
              </>
            ) : (
              <>
                <div
                  className="cursor-pointer"
                  onClick={() => setLargeChart("water")}
                >
                  <FloorsWaterData floorIds={groupFloorsForCharts} />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => setLargeChart("gas")}
                >
                  <FloorsGasData floorIds={groupFloorsForCharts} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 👉 Admin 레이아웃 */}
      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
        <AdminLayout />
      </div>

      {/* 👉 중앙 빌딩 + 위/아래 화살표 */}
      <div className="absolute inset-0 flex z-20 pointer-events-none">
        <div className="w-[554px]" />

        <div className="flex-1 flex justify-center items-end">
          <div
            className="flex flex-col items-center gap-[8px] pb-[45px] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-[483px] h-[40px] mb-[4px]">
              {buildingName && (
                <div className="absolute right-1/2 -translate-x-[180px] top-1/2 -translate-y-1/2 text-s font-semibold text-[#054E76] text-right whitespace-nowrap">
                  {buildingName}
                </div>
              )}

              <button
                type="button"
                onClick={handleUp}
                disabled={!canGoUp}
                className={`absolute left-1/2 -translate-x-1/2 p-0 bg-transparent ${
                  canGoUp ? "cursor-pointer" : "opacity-30 cursor-default"
                }`}
              >
                <img
                  src={upArrow}
                  alt="위층 보기"
                  className="w-[70px] h-[33px]"
                />
              </button>

              <div className="absolute left-5/8 translate-x-[60px] top-1/2 -translate-y-1/2 flex items-center gap-[12px] text-[11px] text-[#054E76]">
                <div className="flex flex-col items-center">
                  <img
                    src={warningIcon}
                    alt="경고"
                    className="w-[24px] h-[24px] mb-[2px]"
                  />
                  <span>경고</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src={alertIcon}
                    alt="주의"
                    className="w-[24px] h-[24px] mb-[2px]"
                  />
                  <span>주의</span>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src={questionIcon}
                    alt="요청"
                    className="w-[24px] h-[24px] mb-[2px]"
                  />
                  <span>요청</span>
                </div>
              </div>
            </div>

            <div className="w-[483px] px-[16px] pb-[34px] pt-[18px] bg-[#DBE0E4] floorContainer">
              <div className="w-[453px] mx-auto gap-[9px] flex flex-col">
                {rows.map((floorName, idx) => (
                  <div key={idx} className="h-[63px] px-[16px] relative">
                    {floorName && (
                      <Floor
                        floor={floorName}
                        selected={selectedFloor === floorName}
                        onClick={() => handleSelectFloor(floorName)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

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

        <div className="w-[554px]" />
      </div>

      {/* 🔸 전체 층 그래프 모달 */}
      {largeChart && (
<<<<<<< HEAD
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          {/* 카드 영역 안은 클릭해도 선택 안 풀리게 */}
=======
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          onClick={closeLargeChart}
        >
>>>>>>> 63f49d55d9f45815223007293574a8ec0f919564
          <div
            className="relative bg-white rounded-[18px] shadow-lg w-[1100px] max-w-[95vw] h-[650px] max-h-[90vh] px-6 py-5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLargeChart}
              className="cursor-pointer absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 text-lg leading-none hover:bg-gray-100"
            >
              ×
            </button>

            <div className="mb-3 pr-10">
              {largeChart === "elec" && (
                <h2 className="text-base font-semibold text-[#054E76]">
                  {buildingName
                    ? `${buildingName} 전체 층 전기 사용량 (오늘 누적)`
                    : "전체 층 전기 사용량 (오늘 누적)"}
                </h2>
              )}
              {largeChart === "temp" && (
                <h2 className="text-base font-semibold text-[#054E76]">
                  {buildingName
                    ? `${buildingName} 전체 층 평균 온도 (오늘)`
                    : "전체 층 평균 온도 (오늘)"}
                </h2>
              )}
              {largeChart === "water" && (
                <h2 className="text-base font-semibold text-[#054E76]">
                  {buildingName
                    ? `${buildingName} 전체 층 수도 사용량 (오늘 누적)`
                    : "전체 층 수도 사용량 (오늘 누적)"}
                </h2>
              )}
              {largeChart === "gas" && (
                <h2 className="text-base font-semibold text-[#054E76]">
                  {buildingName
                    ? `${buildingName} 전체 층 가스 사용량 (오늘 누적)`
                    : "전체 층 가스 사용량 (오늘 누적)"}
                </h2>
              )}
            </div>

            <div className="flex-1 w-full min-h-0">
              {largeChart === "elec" && (
                <FloorsElecData floorIds={allFloors} tall />
              )}
              {largeChart === "temp" && (
                <FloorsTempData floorIds={allFloors} tall />
              )}
              {largeChart === "water" && (
                <FloorsWaterData floorIds={allFloors} tall />
              )}
              {largeChart === "gas" && (
                <FloorsGasData floorIds={allFloors} tall />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
