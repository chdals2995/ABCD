// src/components/adminpage/Vacant.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

function getStatus(empty, total) {
  if (total === 0) {
    return { label: "데이터 없음", className: "bg-gray-200 text-gray-600" };
  }
  if (empty === 0) {
    return { label: "만차", className: "bg-red-100 text-red-700" };
  }

  const ratio = empty / total;

  if (ratio >= 0.5) {
    return { label: "여유", className: "bg-green-100 text-green-700" };
  }
  if (ratio >= 0.2) {
    return { label: "보통", className: "bg-yellow-100 text-yellow-700" };
  }
  return { label: "혼잡", className: "bg-orange-100 text-orange-700" };
}

// ✅ 필요하면 lotId별로 경로를 따로 매핑할 수도 있음(옵션)
// const LOT_ROUTE_MAP = {
//   "lotA": "/ParkingStatus/lotA",
// };

function buildParkingPath(lotId) {
  // return LOT_ROUTE_MAP[lotId] ?? `/ParkingStatus/${encodeURIComponent(lotId)}`;
  return `/parking/${encodeURIComponent(lotId)}`; // 기본: 파라미터 라우팅
}

export default function Vacant() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [stats, setStats] = useState({});

  // parkingSimConfig → 주차장 목록
  useEffect(() => {
    const configRef = ref(rtdb, "parkingSimConfig");

    const unsub = onValue(
      configRef,
      (snap) => {
        const val = snap.val() || {};
        const list = Object.entries(val).map(([lotId, cfg]) => ({
          lotId,
          name: cfg.name || lotId,
          totalSlots: cfg.totalSlots ?? 0,
          enabled: cfg.enabled !== false,
        }));
        setLots(list.filter((lot) => lot.enabled));
      },
      (error) => {
        console.error("Vacant parkingSimConfig read error:", error);
        setLots([]);
      }
    );

    return () => unsub();
  }, []);

  // parkingRealtime/{lotId} → 점유 수
  useEffect(() => {
    if (lots.length === 0) return;

    const unsubs = lots.map((lot) => {
      const lotRef = ref(rtdb, `parkingRealtime/${lot.lotId}`);

      return onValue(
        lotRef,
        (snap) => {
          const raw = snap.val() || {};
          const slotsData = raw.slots || raw;

          const occupied = Object.values(slotsData).filter(
            (slot) => slot && slot.status === "occupied"
          ).length;

          setStats((prev) => ({
            ...prev,
            [lot.lotId]: { occupied },
          }));
        },
        (error) => {
          console.error("Vacant parkingRealtime read error:", lot.lotId, error);
          setStats((prev) => ({
            ...prev,
            [lot.lotId]: { occupied: 0 },
          }));
        }
      );
    });

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [lots]);

  return (
    <div className="w-[553px] h-[302px] border-[12px] border-[#054E76] rounded-[10px] p-[22px] bg-white flex flex-col">
      <h1 className="font-bold font-pyeojin text-[25px] mb-6">주차 잔여수</h1>

      <div className="flex flex-col gap-2 text-[16px]">
        {lots.length === 0 ? (
          <span className="text-sm text-gray-500">
            설정된 주차장이 없습니다.
          </span>
        ) : (
          lots.map((lot) => {
            const total = lot.totalSlots ?? 0;
            const occupied = stats[lot.lotId]?.occupied ?? 0;
            const empty = Math.max(0, total - occupied);
            const status = getStatus(empty, total);

            return (
              <button
                key={lot.lotId}
                type="button"
                onClick={() => navigate(buildParkingPath(lot.lotId))}
                className="flex justify-between items-center w-full text-left rounded-md px-2 py-1 hover:bg-[#E6EEF2] active:scale-[0.99] transition"
                title={`${lot.name} 상세로 이동`}
              >
                <span className="font-medium">{lot.name}</span>

                <div className="flex items-center gap-3">
                  <span className="text-sm">
                    잔여 {empty}대 / {total}대
                  </span>

                  <span
                    className={
                      "text-[11px] px-2 py-[2px] rounded-full font-semibold " +
                      status.className
                    }
                  >
                    {status.label}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
