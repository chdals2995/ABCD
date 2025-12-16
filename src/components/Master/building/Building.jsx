import { useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, set } from "firebase/database";
import Button from "../../../assets/Button";

function toNonNegativeIntString(value) {
  if (value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.max(0, Math.trunc(n)));
}

function toPositiveIntString(value) {
  if (value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "1";
  return String(Math.max(1, Math.trunc(n)));
}

export default function Building() {
  const [form, setForm] = useState({
    name: "",
    down: "",
    floors: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "floors") {
      setForm((prev) => ({ ...prev, floors: toPositiveIntString(value) }));
      return;
    }
    if (name === "down") {
      setForm((prev) => ({ ...prev, down: toNonNegativeIntString(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const Save = async () => {
    if (!form.name || !form.floors) {
      alert("건물명과 전체 층수는 필수입니다.");
      return;
    }

    try {
      const id = crypto.randomUUID();
      await set(ref(rtdb, `buildings/${id}`), {
        name: form.name.trim(),
        floors: Number(form.floors),
        down: form.down === "" ? 0 : Number(form.down),
        createdAt: Date.now(),
      });

      alert("등록되었습니다.");
      setForm({ name: "", down: "", floors: "" });
    } catch (error) {
      console.error("건물 등록 실패:", error);
      alert("등록에 실패하였습니다.");
    }
  };

  return (
    <div>
      <div className="w-[649px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px]">
        {/* 헤더 */}
        <div className="px-[24px] pt-[18px] pb-[12px] border-b border-[#B5DCF3]">
          <p className="text-[24px] font-pyeojin text-[#054E76]">건물 등록</p>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            건물명 / 전체 층수 / 지하 층수를 입력해 주세요.
          </p>
        </div>

        {/* 폼 */}
        <div className="px-[24px] py-[18px]">
          <div className="grid grid-cols-[140px_1fr] items-center gap-x-4 gap-y-4">
            <label htmlFor="name" className="text-[18px] text-[#054E76]">
              건물명
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: ABCD 타워"
              className="h-[36px] w-full rounded-[8px] border border-[#B5DCF3] px-3
                         focus:outline-none focus:ring-2 focus:ring-[#0888D4]/40"
            />

            <label htmlFor="floors" className="text-[18px] text-[#054E76]">
              전체 층수
            </label>
            <input
              id="floors"
              type="number"
              name="floors"
              value={form.floors}
              onChange={handleChange}
              min={1}
              step={1}
              placeholder="예: 23"
              className="h-[36px] w-full rounded-[8px] border border-[#B5DCF3] px-3
                         focus:outline-none focus:ring-2 focus:ring-[#0888D4]/40"
            />

            <label htmlFor="down" className="text-[18px] text-[#054E76]">
              지하
            </label>
            <div className="flex items-center gap-3">
              <input
                id="down"
                type="number"
                name="down"
                value={form.down}
                onChange={handleChange}
                min={0}
                step={1}
                placeholder="예: 2"
                className="h-[36px] w-[160px] rounded-[8px] border border-[#B5DCF3] px-3
                           focus:outline-none focus:ring-2 focus:ring-[#0888D4]/40"
              />
              <span className="text-[13px] text-gray-500">
                (없으면 0 또는 공란)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[79px] mx-auto mt-[22px]">
        <Button onClick={Save}>등록</Button>
      </div>
    </div>
  );
}
