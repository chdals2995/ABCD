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

function calcNextLotIdFromConfig(raw) {
  const nums = Object.keys(raw || {})
    .map(extractParkingNumber)
    .filter((n) => Number.isFinite(n));

  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PARKING_${next}`;
}

export default function Parking() {
  const [buildings, setBuildings] = useState([]); // [{id, name, ...}]
  const [form, setForm] = useState({
    name: "",
    type: "flat", // "flat" | "tower"
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

    // ✅ 마이너스 방지(직접 입력도 차단)
    if (name === "floorCount") {
      if (value === "") {
        setForm((prev) => ({ ...prev, floorCount: "" }));
        return;
      }
      const n = Number(value);
      setForm((prev) => ({
        ...prev,
        floorCount: String(Math.max(1, Number.isFinite(n) ? n : 1)),
      }));
      return;
    }

    if (name === "slotsPerFloor") {
      if (value === "") {
        setForm((prev) => ({ ...prev, slotsPerFloor: "" }));
        return;
      }
      const n = Number(value);
      setForm((prev) => ({
        ...prev,
        slotsPerFloor: String(Math.max(1, Number.isFinite(n) ? n : 1)),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerFloorSlotChange = (idx, value) => {
    // ✅ 마이너스 방지(층별 주차 가능 대수는 0 이상)
    let nextValue = value;
    if (value === "") nextValue = "";
    else {
      const n = Number(value);
      nextValue = String(Math.max(0, Number.isFinite(n) ? n : 0));
    }

    setForm((prev) => {
      const next = [...(prev.perFloorSlots || [])];
      next[idx] = nextValue;
      return { ...prev, perFloorSlots: next };
    });
  };

  // ✅ lotId 자동 생성(미노출): 저장 시점에 PARKING_최대+1 계산
  const generateNextLotId = async () => {
    const snap = await get(ref(rtdb, "parkingSimConfig"));
    const raw = snap.val() || {};

    let nextId = calcNextLotIdFromConfig(raw);

    const used = new Set(Object.keys(raw || {}));
    while (used.has(nextId)) {
      const n = extractParkingNumber(nextId) ?? 0;
      nextId = `PARKING_${n + 1}`;
    }

    return nextId;
  };

  const Save = async () => {
    if (!form.name) {
      alert("주차장 명은 필수입니다.");
      return;
    }
    if (!form.belongsto) {
      alert("소속 건물 명을 선택해 주세요.");
      return;
    }

    const floorCount = toNumber(form.floorCount, 0);
    if (floorCount <= 0) {
      alert("층 수는 1 이상이어야 합니다.");
      return;
    }

    if (form.type === "tower") {
      const spf = toNumber(form.slotsPerFloor, 0);
      if (spf <= 0) {
        alert("타워는 층당 주차 가능 대수가 1 이상이어야 합니다.");
        return;
      }
    } else {
      if (!form.perFloorSlots || form.perFloorSlots.length !== floorCount) {
        alert("flat은 층별 주차 가능 대수를 모두 입력해야 합니다.");
        return;
      }
    }

    let lotId = "";
    try {
      lotId = await generateNextLotId();
    } catch (e) {
      console.error("lotId 자동 생성 실패:", e);
      alert("lotId 자동 생성 실패");
      return;
    }

    const payload = {
      enabled: true,
      floorCount,
      lotId,
      name: form.name,
      totalSlots,
      type: form.type,
      createdAt: Date.now(),
      belongsto: form.belongsto,
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
        name: "",
        type: "flat",
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
      <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] 
      overflow-y-auto mx-auto">
        <div className="px-[24px] py-5 w-143 mx-auto">
          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">주차장 명</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: 주차장 3"
              className="h-[30px] w-[260px]"
            />
          </div>

          <div className="flex justify-between w-[520px] mb-[10px]">
            <label className="text-[20px]">소속 건물 명</label>
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
            <label className="text-[20px]">층 수</label>
            <input
              type="number"
              name="floorCount"
              value={form.floorCount}
              onChange={handleChange}
              min={1}
              step={1}
              className="h-[30px] w-[260px]"
            />
          </div>

          {form.type === "tower" ? (
            <div className="flex justify-between w-[520px] mb-[10px]">
              <label className="text-[20px]">층당 주차 가능 대수</label>
              <input
                type="number"
                name="slotsPerFloor"
                value={form.slotsPerFloor}
                onChange={handleChange}
                min={1}
                step={1}
                className="h-[30px] w-[260px]"
              />
            </div>
          ) : (
            <div className="w-[520px] mb-[10px]">
              <div className="text-[20px] mb-[6px]">층별 주차 가능 대수</div>

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
                      min={0}
                      step={1}
                      className="h-[28px] w-[140px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between w-[520px]">
            <label className="text-[20px]">전체 주차 가능 대수</label>
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
