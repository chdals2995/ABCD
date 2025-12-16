// src/components/Master/parking/Parking.jsx
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, get, set, onValue } from "firebase/database";
import Button from "../../../assets/Button";

const DEFAULT_TICK_MS = 1000;
const DEFAULT_ENTRY_PROB = 0.1;
const DEFAULT_EXIT_PROB = 0.2;

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function makePerFloorObj(arr) {
  const obj = {};
  arr.forEach((v, i) => {
    obj[i] = toNumber(v, 0);
  });
  return obj;
}

function extractParkingNumber(id) {
  const m = String(id || "").match(/^PARKING_(\d+)$/i);
  return m ? Number(m[1]) : null;
}

export default function Parking() {
  const [buildings, setBuildings] = useState([]); // [{id, name, ...}]
  const [form, setForm] = useState({
    lotId: "",
    name: "",
    type: "flat", // "flat" | "tower"
    enabled: true,

    // ✅ 소속 건물(이름) 저장
    belongsto: "",

    floorCount: "",
    slotsPerFloor: "2", // tower용
    perFloorSlots: [], // flat용
  });

  // ✅ buildings 목록 가져오기
  useEffect(() => {
    const buildingsRef = ref(rtdb, "buildings");
    return onValue(buildingsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setBuildings([]);
        return;
      }
      const list = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      // 보기 좋게 이름순 정렬(원하면 createdAt순으로 바꿔도 됨)
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );

      setBuildings(list);
    });
  }, []);

  // flat: floorCount 바뀌면 perFloorSlots 길이 자동 맞추기
  useEffect(() => {
    if (form.type !== "flat") return;

    const fc = toNumber(form.floorCount, 0);
    if (fc <= 0) {
      setForm((prev) => ({ ...prev, perFloorSlots: [] }));
      return;
    }

    setForm((prev) => {
      const next = [...(prev.perFloorSlots || [])];
      next.length = fc;
      for (let i = 0; i < fc; i++) {
        if (next[i] === undefined || next[i] === null) next[i] = 0;
      }
      return { ...prev, perFloorSlots: next };
    });
  }, [form.floorCount, form.type]);

  const totalSlots = useMemo(() => {
    const fc = toNumber(form.floorCount, 0);
    if (form.type === "tower") {
      const spf = toNumber(form.slotsPerFloor, 0);
      return fc * spf;
    }
    return (form.perFloorSlots || []).reduce(
      (sum, v) => sum + toNumber(v, 0),
      0
    );
  }, [form.floorCount, form.slotsPerFloor, form.perFloorSlots, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setForm((prev) => ({
        ...prev,
        type: value,
        perFloorSlots: value === "flat" ? prev.perFloorSlots : [],
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnabledRadio = (value) => {
    setForm((prev) => ({ ...prev, enabled: value === "true" }));
  };

  const handlePerFloorSlotChange = (idx, value) => {
    setForm((prev) => {
      const next = [...(prev.perFloorSlots || [])];
      next[idx] = value;
      return { ...prev, perFloorSlots: next };
    });
  };

  // lotId 자동 생성: PARKING_최대+1
  const handleAutoLotId = async () => {
    try {
      const snap = await get(ref(rtdb, "parkingSimConfig"));
      const raw = snap.val() || {};
      const nums = Object.keys(raw)
        .map(extractParkingNumber)
        .filter((n) => Number.isFinite(n));

      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      setForm((prev) => ({ ...prev, lotId: `PARKING_${next}` }));
    } catch (e) {
      console.error("lotId 자동 생성 실패:", e);
      alert("lotId 자동 생성 실패");
    }
  };

  const Save = async () => {
    const lotId = String(form.lotId || "").trim();
    if (!lotId) {
      alert("lotId는 필수입니다. (예: PARKING_3)");
      return;
    }
    if (!form.name) {
      alert("주차장 이름은 필수입니다.");
      return;
    }
    if (!form.belongsto) {
      alert("소속 건물을 선택해 주세요.");
      return;
    }

    const floorCount = toNumber(form.floorCount, 0);
    if (floorCount <= 0) {
      alert("층 수(floorCount)는 1 이상이어야 합니다.");
      return;
    }

    if (form.type === "tower") {
      const spf = toNumber(form.slotsPerFloor, 0);
      if (spf <= 0) {
        alert("타워는 층당 슬롯(slotsPerFloor)이 1 이상이어야 합니다.");
        return;
      }
    } else {
      if (!form.perFloorSlots || form.perFloorSlots.length !== floorCount) {
        alert("flat은 층별 슬롯(perFloorSlots)을 모두 입력해야 합니다.");
        return;
      }
    }

    // 중복 체크
    const existsSnap = await get(ref(rtdb, `parkingSimConfig/${lotId}`));
    if (existsSnap.exists()) {
      const ok = window.confirm("같은 lotId가 이미 있습니다. 덮어쓸까요?");
      if (!ok) return;
    }

    const payload = {
      enabled: !!form.enabled,
      floorCount,
      lotId,
      name: form.name,
      totalSlots,
      type: form.type,
      createdAt: Date.now(),

      // ✅ 소속 건물 이름
      belongsto: form.belongsto,

      // (입력 안 받지만 기본값으로 저장)
      tickMs: DEFAULT_TICK_MS,
      entryProb: DEFAULT_ENTRY_PROB,
      exitProb: DEFAULT_EXIT_PROB,
    };

    if (form.type === "tower") {
      payload.slotsPerFloor = toNumber(form.slotsPerFloor, 0);
    } else {
      payload.perFloorSlots = makePerFloorObj(form.perFloorSlots);
    }

    try {
      await set(ref(rtdb, `parkingSimConfig/${lotId}`), payload);

      alert("등록되었습니다.");
      setForm({
        lotId: "",
        name: "",
        type: "flat",
        enabled: true,
        belongsto: "",
        floorCount: "",
        slotsPerFloor: "2",
        perFloorSlots: [],
      });
    } catch (error) {
      console.error("주차장 등록 실패:", error);
      alert("등록에 실패하였습니다.");
    }
  };

  return (
    <div>
      <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] overflow-y-auto">
        <div className="px-[24px] py-[20px]">
          {/* lotId + 자동생성 */}
          <div className="flex justify-between w-[520px] mb-[10px] items-center">
            <label className="text-[20px]">lotId</label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                name="lotId"
                value={form.lotId}
                onChange={handleChange}
                placeholder="예: PARKING_3"
                className="h-[30px] w-[190px]"
              />
              <button
                type="button"
                onClick={handleAutoLotId}
                className="h-[30px] px-3 rounded-[8px] bg-[#0888D4] text-white text-[14px] hover:bg-[#054E76] transition"
              >
                자동
              </button>
            </div>
          </div>

          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: 주차장 3"
              className="h-[30px] w-[260px]"
            />
          </div>

          {/* ✅ 소속 건물 선택 */}
          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">소속 건물</label>
            <select
              name="belongsto"
              value={form.belongsto}
              onChange={handleChange}
              className="h-[30px] w-[260px]"
            >
              <option value="">선택</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.name || ""}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">타입</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="h-[30px] w-[260px]"
            >
              <option value="flat">flat (주차장)</option>
              <option value="tower">tower (주차타워)</option>
            </select>
          </div>

          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">사용 여부</label>
            <div className="w-[260px] flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="enabledRadio"
                  checked={form.enabled === true}
                  onChange={() => handleEnabledRadio("true")}
                />
                사용
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="enabledRadio"
                  checked={form.enabled === false}
                  onChange={() => handleEnabledRadio("false")}
                />
                미사용
              </label>
            </div>
          </div>

          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">층 수(floorCount)</label>
            <input
              type="number"
              name="floorCount"
              value={form.floorCount}
              onChange={handleChange}
              className="h-[30px] w-[260px]"
            />
          </div>

          {form.type === "tower" ? (
            <div className="flex justify-between w-[520px] mb-[10px]">
              <label className="text-[20px]">층당 슬롯(slotsPerFloor)</label>
              <input
                type="number"
                name="slotsPerFloor"
                value={form.slotsPerFloor}
                onChange={handleChange}
                className="h-[30px] w-[260px]"
              />
            </div>
          ) : (
            <div className="w-[520px] mb-[10px]">
              <div className="text-[20px] mb-[6px]">
                층별 슬롯(perFloorSlots)
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {(form.perFloorSlots || []).map((v, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[18px] w-[70px]">{i + 1}층</span>
                    <input
                      type="number"
                      value={v}
                      onChange={(e) =>
                        handlePerFloorSlotChange(i, e.target.value)
                      }
                      className="h-[28px] w-[140px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between w-[520px]">
            <label className="text-[20px]">totalSlots</label>
            <input
              type="number"
              value={totalSlots}
              readOnly
              className="h-[30px] w-[260px] bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="w-[79px] mx-auto mt-[29px]">
        <Button onClick={Save}>등록</Button>
      </div>
    </div>
  );
}
