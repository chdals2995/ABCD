// asset/pages/AssetEx.jsx
import { useState } from "react";
import Button from "../assets/Button";
import Select from "../assets/Select";
import Modal from "../assets/Modal";

const onClick = () => {
  alert("버튼 클릭됨");
};

const options = [
  { value: "1", label: "2층 201호 앞 복도" },
  { value: "2", label: "2번" },
  { value: "3", label: "3번" },
];

export default function AssetEx() {
  const [number, setNumber] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={onClick}>qjxms</Button>

      <Select
        label={"셀랙트 박스"}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        options={options}
        placeholder="숫자를 선택하세요"
      />

      <Button onClick={() => setOpen(true)}>모달 열기</Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        panelClassName="w-[1000px] h-[900px]" // ✅ Tailwind 유틸로 사이즈 지정
      >
        <div className="border-b px-6 py-3 font-semibold text-sm">
          커스텀 모달
        </div>

        <div className="flex-1 px-6 py-4 text-sm">
          안쪽 내용은 각 페이지에서 필요한 컴포넌트를 넣어서 자유롭게 디자인하면
          됩니다.
        </div>

        <div className="border-t px-6 py-3 flex justify-end gap-2 text-sm">
          <button
            className="px-3 py-1 border rounded-full"
            onClick={() => setOpen(false)}
          >
            취소
          </button>
          <button
            className="px-3 py-1 border rounded-full bg-[#0888D4] text-white"
            onClick={() => setOpen(false)}
          >
            확인
          </button>
        </div>
      </Modal>
    </>
  );
}
