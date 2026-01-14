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

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ 숫자 마이너스 방지 + 정수 처리
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

  // 저장 버튼 클릭
  const Save = async () => {
    if (!form.name || !form.floors) {
      alert("건물명과 전체 층수는 필수입니다.");
      return;
    }

    try {
      const id = crypto.randomUUID(); // 랜덤 ID
      await set(ref(rtdb, `buildings/${id}`), {
        name: form.name,
        floors: Number(form.floors),
        down: form.down === "" ? 0 : Number(form.down),
        createdAt: Date.now(),
      });

      alert("등록되었습니다.");

      setForm({
        name: "",
        down: "",
        floors: "",
      });
    } catch (error) {
      console.error("건물 등록 실패:", error);
      alert("등록에 실패하였습니다.");
    }
  };

  return (
    <div>
      <div className="w-[649px] h-[308px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px]
        mx-auto">
        <div className="flex flex-col w-86 mx-auto transform translate-y-20">
          <div className="flex justify-between w-[342px]">
            <label htmlFor="name" className="text-[20px] mb-[10px]">
              건물명
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="h-[30px]"
            />
          </div>

          <div className="flex justify-between w-[342px]">
            <label htmlFor="floors" className="text-[20px] mb-[10px]">
              전체 층수
            </label>
            <input
              type="number"
              name="floors"
              value={form.floors}
              onChange={handleChange}
              min={1}
              step={1}
              className="h-[30px]"
            />
          </div>

          <div className="flex justify-between w-[342px]">
            <label htmlFor="down" className="text-[20px] mb-[10px]">
              지하
            </label>
            <input
              type="number"
              name="down"
              value={form.down}
              onChange={handleChange}
              min={0}
              step={1}
              className="h-[30px]"
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
