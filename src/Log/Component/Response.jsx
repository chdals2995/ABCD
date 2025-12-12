import CloseIcon from "../../assets/icons/close.png";
import Button from "../../assets/Button";


export default function Response({ onClose, onSend }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* 바깥 박스 */}
      <div className="w-[700px] bg-white rounded-lg relative p-10">

        {/* 닫기 버튼 */}
        <img
          src={CloseIcon}
          className="absolute top-4 right-4 w-[28px] cursor-pointer"
          onClick={onClose}
        />

        {/* 타이틀 */}
        <h2 className="text-[24px] text-center font-medium mb-6">
          Re: 요청사항
        </h2>

        {/* 상태 표시 영역 */}
        <div className="bg-[#E6EEF2] rounded-lg p-6">

          {/* 상태 라벨 */}
          <div className="flex justify-center gap-8 text-[18px] mb-4">
            <span className="flex items-center gap-2">
              ● <span>접수</span>
            </span>
            <span className="flex items-center gap-2 text-[#25C310]">
              ● <span>처리중</span>
            </span>
            <span className="flex items-center gap-2 text-[#367CFF]">
              ● <span>완료</span>
            </span>
          </div>

          {/* 답신 입력 영역 */}
          <div className="flex justify-center">
            <textarea
              placeholder="내용"
              className="
                w-[630px] h-[400px]
                border border-gray-400
                p-4 text-[18px]
                resize-none
              "
            />
          </div>
        </div>

        {/* 보내기 버튼 */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={onSend}
            className="
              w-[155px] h-[68px]
              border border-black
              text-[20px]
              hover:bg-gray-100
            "
          >
            보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
