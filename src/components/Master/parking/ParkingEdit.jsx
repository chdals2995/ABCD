// src/components/Master/parking/ParkingEdit.jsx
import Close from "../../../assets/icons/close.png";
import Modal from "../../../assets/Modal";
import Button from "../../../assets/Button";
import { useEffect, useMemo, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, update, remove, onValue } from "firebase/database";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function extractPerFloorArray(perFloorSlots, floorCount) {
  const fc = toNumber(floorCount, 0);
  const arr = Array.from({ length: fc }, () => 0);
  if (!perFloorSlots) return arr;

  Object.entries(perFloorSlots).forEach(([k, v]) => {
    const idx = toNumber(k, -1);
    if (idx >= 0 && idx < fc) arr[idx] = toNumber(v, 0);
  });

  return arr;
}

function makePerFloorObj(arr) {
  const obj = {};
  arr.forEach((v, i) => {
    obj[i] = toNumber(v, 0);
  });
  return obj;
}

export default function ParkingEdit({ parking, open, close }) {
  const [buildings, setBuildings] = useState([]);

  const [form, setForm] = useState({
    lotId: "",
    name: "",
    type: "flat",
    belongsto: "",
    floorCount: "",
    slotsPerFloor: "2",
    perFloorSlots: [],
  });

  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!parking) return;

    const floorCount = String(parking.floorCount ?? "");
    const type = parking.type || "flat";
    const lotId = parking.lotId || parking.id || "";

    setForm({
      lotId,
      name: parking.name || "",
      type,
      belongsto: parking.belongsto || "",
      floorCount,
      slotsPerFloor: String(parking.slotsPerFloor ?? "2"),
      perFloorSlots:
        type === "flat"
          ? extractPerFloorArray(parking.perFloorSlots, floorCount)
          : [],
    });

    setError("");
  }, [parking]);

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

    // ✅ 마이너스 방지
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

  const SaveEdit = async () => {
    if (!form.lotId) {
      setError("lotId가 없습니다.");
      return;
    }
    if (!form.name) {
      setError("주차장 명은 필수입니다.");
      return;
    }
    if (!form.belongsto) {
      setError("소속 건물 명을 선택해 주세요.");
      return;
    }

    const fc = toNumber(form.floorCount, 0);
    if (fc <= 0) {
      setError("층 수는 1 이상이어야 합니다.");
      return;
    }

    if (form.type === "tower") {
      const spf = toNumber(form.slotsPerFloor, 0);
      if (spf <= 0) {
        setError("타워는 층당 주차 가능 대수가 1 이상이어야 합니다.");
        return;
      }
    } else {
      if (!form.perFloorSlots || form.perFloorSlots.length !== fc) {
        setError("flat은 층별 주차 가능 대수를 모두 입력해야 합니다.");
        return;
      }
    }

    try {
      const payload = {
        enabled: true,
        floorCount: fc,
        lotId: form.lotId,
        name: form.name,
        totalSlots,
        type: form.type,
        updatedAt: Date.now(),
        belongsto: form.belongsto,
      };

      if (form.type === "tower") {
        payload.slotsPerFloor = toNumber(form.slotsPerFloor, 0);
        payload.perFloorSlots = null;
      } else {
        payload.perFloorSlots = makePerFloorObj(form.perFloorSlots);
        payload.slotsPerFloor = null;
      }

      await update(ref(rtdb, `parkingSimConfig/${form.lotId}`), payload);

      alert("수정되었습니다.");
      close();
    } catch (e) {
      console.error("주차장 수정 실패:", e);
      setError("수정에 실패하였습니다.");
    }
  };

  const DeleteParking = async () => {
    if (!form.lotId) return;

    const ok = window.confirm(
      `정말 삭제할까요?\n\n- parkingSimConfig/${form.lotId}\n- parkingRealtime/${form.lotId}\n\n(되돌릴 수 없습니다)`
    );
    if (!ok) return;

    try {
      await remove(ref(rtdb, `parkingSimConfig/${form.lotId}`));
      await remove(ref(rtdb, `parkingRealtime/${form.lotId}`));
      alert("삭제되었습니다.");
      close();
    } catch (e) {
      console.error("주차장 삭제 실패:", e);
      alert("삭제에 실패하였습니다.");
    }
  };

  if (!open || !parking) return null;

  return (
    <Modal isOpen={open} onClose={close}>
      <div className="ml-[66px] relative">
        <p className="text-[26px] font-pyeojin mt-[71px]">주차장 정보</p>
        <img
          src={Close}
          alt="닫기"
          className="w-[41px] h-[41px] absolute top-3 right-3"
          onClick={close}
        />
      </div>

      <div
        className="w-[520px] bg-white 
          ml-[66px] mt-[19px] pt-[20px] px-[28px] rounded-[10px]
          shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
          overflow-y-auto max-h-[420px]"
      >
        <div className="flex justify-between w-[460px] mb-[10px]">
          <label className="text-[20px]">주차장 명</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="h-[30px] w-[260px]"
          />
        </div>

        <div className="flex justify-between w-[460px] mb-[10px]">
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

        <div className="flex justify-between w-[460px] mb-[10px]">
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

        <div className="flex justify-between w-[460px] mb-[10px]">
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
          <div className="flex justify-between w-[460px] mb-[10px]">
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
          <div className="w-[460px] mb-[10px]">
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

        <div className="flex justify-between w-[460px]">
          <label className="text-[20px]">전체 주차 가능 대수</label>
          <input
            type="number"
            value={totalSlots}
            readOnly
            className="h-[30px] w-[260px] bg-gray-100"
          />
        </div>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
      </div>

      <div className="flex justify-center gap-4 mt-[29px]">
        <div className="w-[79px]">
          <Button onClick={SaveEdit}>저장</Button>
        </div>

        <button
          type="button"
          onClick={DeleteParking}
          className="w-[79px] h-[40px] rounded-[8px] bg-red-500 text-white font-semibold hover:bg-red-600 transition"
        >
          삭제
        </button>
      </div>
    </Modal>
  );
}
