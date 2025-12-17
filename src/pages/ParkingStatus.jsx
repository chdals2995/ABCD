// src/pages/ParkingStatus.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";
import { rtdb } from "../firebase/config";
import { ref, onValue } from "firebase/database";

import ParkingTower from "../components/parkingstatus/ParkingTower";
import ParkingFlatView from "../components/parkingstatus/ParkingFlatView";

// floor 필드에서 숫자만 뽑아서 층수 인덱스로 사용 (1F, B2 이런 것들)
function getFloorIndex(floorValue) {
  if (typeof floorValue === "number") return floorValue;
  if (typeof floorValue === "string") {
    const m = floorValue.match(/(-?\d+)/); // -2, 1, 10 등
    if (m) return parseInt(m[1], 10);
  }
  return 0;
}

// 슬롯 ID의 마지막 숫자로 좌/우 구분 (홀수: L, 짝수: R)
function getSideFromSlotId(slotId) {
  if (!slotId) return "L";
  const m = slotId.match(/(\d+)(?!.*\d)/); // 맨 마지막 숫자
  if (!m) return "L";
  const num = parseInt(m[1], 10);
  if (Number.isNaN(num)) return "L";
  return num % 2 === 1 ? "L" : "R";
}

// status / carCode를 보고 점유 여부 판단
function isSlotOccupied(raw) {
  if (!raw) return false;

  if (typeof raw.status === "string") {
    const s = raw.status.toLowerCase();
    if (s === "empty" || s === "free") return false;
    return true;
  }

  if (raw.carCode) return true;

  return false;
}

export default function ParkingStatus() {
  const { lotId } = useParams(); // 예: /parking/PARKING_1
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [meta, setMeta] = useState(null); // parkingRealtime/meta
  const [slots, setSlots] = useState([]); // parkingRealtime/slots
  const [config, setConfig] = useState(null); // parkingSimConfig/{lotId}
  const [parkingType, setParkingType] = useState("tower"); // "tower" | "flat"

  // ✅ 전체 주차장 목록(이전/다음 네비용)
  const [lotIds, setLotIds] = useState([]);
  const [lotListLoaded, setLotListLoaded] = useState(false);

  // ✅ parkingSimConfig 전체에서 lotId 목록 가져오기
  useEffect(() => {
    const listRef = ref(rtdb, "parkingSimConfig");

    const unsub = onValue(
      listRef,
      (snap) => {
        const obj = snap.val() || {};
        const ids = Object.keys(obj).sort((a, b) => a.localeCompare(b)); // "첫번째/마지막" 기준
        setLotIds(ids);
        setLotListLoaded(true);
      },
      () => {
        setLotIds([]);
        setLotListLoaded(true);
      }
    );

    return () => unsub();
  }, []);

  const currentIndex = useMemo(() => {
    if (!lotId) return -1;
    return lotIds.indexOf(lotId);
  }, [lotIds, lotId]);

  const prevLotId = useMemo(() => {
    if (currentIndex <= 0) return null; // 첫번째면 이전 없음
    return lotIds[currentIndex - 1] ?? null;
  }, [currentIndex, lotIds]);

  const nextLotId = useMemo(() => {
    if (currentIndex < 0) return null;
    if (currentIndex >= lotIds.length - 1) return null; // 마지막이면 다음 없음
    return lotIds[currentIndex + 1] ?? null;
  }, [currentIndex, lotIds]);

  useEffect(() => {
    if (!lotId) return;

    const lotRef = ref(rtdb, `parkingRealtime/${lotId}`);
    const configRef = ref(rtdb, `parkingSimConfig/${lotId}`);

    // 🔹 실시간 주차 슬롯 + meta
    const unsubRealtime = onValue(
      lotRef,
      (snap) => {
        const value = snap.val() || {};
        const metaVal = value.meta || {};
        const slotsObj = value.slots || {};

        const normalizedSlots = Object.entries(slotsObj).map(
          ([slotId, raw]) => {
            const floorIndex = getFloorIndex(raw.floor);
            const side = getSideFromSlotId(slotId);
            const occupied = isSlotOccupied(raw);

            return {
              id: slotId,
              floorIndex,
              side,
              occupied,
              carCode: raw.carCode || "",
              raw,
            };
          }
        );

        setMeta(metaVal);
        setSlots(normalizedSlots);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("parkingRealtime read error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 🔹 시뮬 설정에서 config 읽기 (층 수, 층당 슬롯, 타입 등)
    const unsubConfig = onValue(configRef, (snap) => {
      const cfg = snap.val();
      if (cfg) {
        setConfig(cfg);
        if (cfg.type) setParkingType(cfg.type); // "tower" or "flat"
      } else {
        setConfig(null);
      }
    });

    return () => {
      unsubRealtime();
      unsubConfig();
    };
  }, [lotId]);

  // ------- 통계 계산 -------
  const totalSlotsRealtime = slots.length;
  const occupiedCount = slots.filter((s) => s.occupied).length;
  const freeCount = totalSlotsRealtime - occupiedCount;

  const floorCount =
    (config && typeof config.floorCount === "number"
      ? config.floorCount
      : meta?.floorCount) ?? null;

  const slotsPerFloor =
    (config &&
      (config.perFloorSlots ?? config.slotsPerFloor) !== undefined &&
      Number(config.perFloorSlots ?? config.slotsPerFloor)) ||
    null;

  const totalSlots =
    (config && typeof config.totalSlots === "number"
      ? config.totalSlots
      : totalSlotsRealtime) ?? 0;

  return (
    <>
      {/* 🔹 전체 화면 배경: 레이아웃 밑에 깔림 */}
      <div className="fixed inset-0 bg-[#E6EEF2] -z-10" />

      <AdminLayout />

      {/* 🔹 건물 보기 버튼 (Floors 페이지 이동) */}
      <button
        type="button"
        onClick={() => navigate("/floors")}
        className="
          fixed left-[180px] top-[180px] z-20
          bg-[#0888D4] text-white text-sm font-semibold
          px-4 py-2 rounded-[8px] shadow
          hover:bg-[#054E76] transition
        "
      >
        건물 보기
      </button>

      {/* ✅ 이전/다음 주차장 버튼 (첫번째/마지막이면 자동 숨김) */}
      {lotListLoaded && prevLotId && (
        <button
          type="button"
          onClick={() => navigate(`/parking/${prevLotId}`)}
          className="
            fixed left-[180px] top-[235px] z-20
            bg-white text-[#054E76] text-sm font-semibold
            px-4 py-2 rounded-[8px] shadow
            border border-[#B5DCF3]
            hover:bg-[#F3FAFF] transition
          "
        >
          ← 이전 주차장
        </button>
      )}

      {lotListLoaded && nextLotId && (
        <button
          type="button"
          onClick={() => navigate(`/parking/${nextLotId}`)}
          className="
            fixed left-[310px] top-[235px] z-20
            bg-white text-[#054E76] text-sm font-semibold
            px-4 py-2 rounded-[8px] shadow
            border border-[#B5DCF3]
            hover:bg-[#F3FAFF] transition
          "
        >
          다음 주차장 →
        </button>
      )}

      {/* 🔹 실제 내용: 위쪽은 레이아웃 높이만큼 띄우기 */}
      <div className="min-h-screen pt-[120px] pb-10">
        <div className="max-w-[1200px] mx-auto flex gap-8 items-start justify-center">
          {loading ? (
            <div className="text-sm text-gray-600">
              실시간 데이터 불러오는 중…
            </div>
          ) : error ? (
            <div className="text-sm text-red-500">에러: {error}</div>
          ) : (
            <>
              {/* 🔹 왼쪽: 주차 레이아웃 (타워 / 평면) */}
              {parkingType === "flat" ? (
                <ParkingFlatView slots={slots} />
              ) : (
                <ParkingTower
                  slots={slots}
                  slotsPerFloor={slotsPerFloor || 2} // ⬅ 여기!
                />
              )}

              {/* 🔹 오른쪽: 요약 정보 (폭 줄이기) */}
              <div className="w-[260px] min-h-[300px] flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#054E76]">
                    {config?.name || meta?.name || lotId}
                  </h2>

                  <p className="text-sm text-gray-600 mt-2">
                    총 층:{" "}
                    <span className="font-semibold">
                      {floorCount !== null ? `${floorCount}층` : "-층"}
                    </span>{" "}
                    / 층당 슬롯:{" "}
                    <span className="font-semibold">
                      {slotsPerFloor !== null ? `${slotsPerFloor}대` : "-대"}
                    </span>{" "}
                    / 총 슬롯:{" "}
                    <span className="font-semibold">{totalSlots}대</span>
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    타입: {parkingType === "flat" ? "평면" : "타워"}
                  </p>

                  {/* (선택) 현재 몇 번째인지 */}
                  {lotListLoaded && currentIndex >= 0 && lotIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentIndex + 1} / {lotIds.length}
                    </p>
                  )}
                </div>

                <div className="mt-10 text-sm">
                  <p className="font-semibold mb-3">주차 현황</p>

                  <p className="mb-1">
                    전체{" "}
                    <span className="font-semibold">{totalSlotsRealtime}</span>
                    대 중{" "}
                    <span className="font-semibold text-[#F1593A]">
                      {occupiedCount}
                    </span>
                    대 주차 중
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-3 h-3 rounded-full bg-[#0FA958]" />
                    <span>주차 가능 : {freeCount}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 rounded-full bg-[#F1593A]" />
                    <span>주차 중 : {occupiedCount}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
