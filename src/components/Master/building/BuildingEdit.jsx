import Close from "../../../assets/icons/close.png";
import Modal from "../../../assets/Modal";
import Button from "../../../assets/Button";
import { useState, useEffect } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, update } from "firebase/database";

export default function BuildingEdit({ building, open, close }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    down: "",
    floors: "",
    park: "no",
    parkf: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (building) {
      setForm({
        id: building.id,
        name: building.name,
        down: building.down,
        floors: building.floors,
        park: building.park,
        parkf: building.parkf,
      });
      setError("");
    }
  }, [building]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const SaveEdit = async () => {
    if (!form.name || !form.floors) {
      setError("건물명과 전체 층수는 필수입니다.");
      return;
    }

    try {
      await update(ref(rtdb, `buildings/${form.id}`), {
        name: form.name,
        down: form.down,
        floors: form.floors,
        park: form.park,
        parkf: form.parkf,
        updatedAt: Date.now(),
      });

      alert("수정되었습니다.");
      close(); // 모달 닫기
    } catch (error) {
      console.error("수정 실패:", error);
      setError("수정에 실패하였습니다.");
    }
  };

  if (!open || !building) return null;

  return (
    <>
      <Modal isOpen={open} onClose={close}>
        {/* 제목과 닫기 */}
        <div className="ml-[66px] relative">
          <p className="text-[26px] font-pyeojin mt-[71px]">건물 정보</p>
          <img
            src={Close}
            alt="닫기"
            className="w-[41px] h-[41px] absolute top-3 right-3"
            onClick={() => close()}
          />
        </div>
        {/* 건물 정보 */}
        <div
          className="w-[422px] h-[224px] bg-white 
                  ml-[66px] mt-[19px] pt-[38px] px-[66px] rounded-[10px]
                  shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
                  flex justify-between"
        >
          <div className="flex flex-col items-end w-[75px]">
            <div>
              <label htmlFor="name" className="text-[20px] mb-[10px]">
                건물명
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="floors" className="text-[20px] mb-[10px]">
                전체 층수
              </label>
              <input
                type="number"
                id="floors"
                value={form.floors}
                onChange={handleChange}
              />
            </div>
            <div className="w-[100px]">
              <label htmlFor="down" className="text-[20px] mb-[10px]">
                지하
              </label>
              <input
                type="number"
                id="down"
                value={form.down}
                onChange={handleChange}
                className="w-[60px]"
              />
            </div>

            <div>
              <label htmlFor="park" className="text-[20px] mb-[10px]">
                주차타워
              </label>
              <input
                type="radio"
                name="park"
                value="yes"
                checked={form.park === "yes"}
                onChange={handleChange}
              />
              유
              <input
                type="radio"
                name="park"
                value="no"
                checked={form.park === "no"}
                onChange={handleChange}
              />
              무
            </div>
            {form.park === "yes" && (
              <div>
                <label htmlFor="parkf" className="text-[20px] mb-[10px]">
                  층수
                </label>
                <input
                  type="number"
                  id="parkf"
                  value={form.parkf}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
          {/* 에러 메시지 */}
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
        {/* 승인버튼 */}
        <div className="w-[79px] mx-auto mt-[29px]">
          <Button onClick={SaveEdit}>저장</Button>
        </div>
      </Modal>
    </>
  );
}
