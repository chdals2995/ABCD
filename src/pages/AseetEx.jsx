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

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        {/* 모달 안 내용 예시 */}
        <div
          className="
            bg-white rounded-2xl
            w-[800px] max-w-[calc(100%-80px)]
            h-[500px]
            flex flex-col
            shadow-[0_12px_30px_rgba(0,0,0,0.16)]
          "
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-900">커스텀 모달</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-xl leading-none text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 px-6 py-5 text-sm text-gray-700">
            <p>
              안쪽 내용은 각 페이지에서 필요한 컴포넌트를 넣어서 자유롭게
              디자인하면 됩니다.
            </p>
          </div>

          {/* 푸터 */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
            <button
              className="px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              취소
            </button>
            <button className="px-3 py-1.5 text-sm rounded-lg bg-[#054E76] text-white hover:brightness-110">
              확인
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
