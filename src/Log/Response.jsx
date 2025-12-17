import { useState } from "react";
import CloseIcon from "../assets/icons/close.png";
import Button from "../assets/Button";

export default function Response({ onClose, onSend, data }) {
  // ✅ 초기값을 함수로 계산 (useEffect 제거)
  const [title, setTitle] = useState(() => {
    if (data?.title) return `Re: ${data.title}`;
    return "Re: 요청사항";
  });

  const [reply, setReply] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[700px] bg-white rounded-lg relative p-10">
        {/* 닫기 */}
        <img
          src={CloseIcon}
          className="absolute top-4 right-4 w-[28px] cursor-pointer"
          onClick={onClose}
        />

        {/* 제목 input */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="
              w-[420px]
              text-[24px]
              font-medium
              text-center
              border-b-2 border-[#054E76]
              bg-transparent
              outline-none
            "
          />
        </div>

        {/* 본문 영역 */}
        <div className="bg-[#E6EEF2] rounded-lg p-6 w-[580px] h-[550px] ml-[25px]">
          {/* 상태 표시 */}
          <div className="flex justify-center gap-22 text-[18px] mb-4 mt-10">
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

          {/* 답장 내용 */}
          <div className="flex justify-center">
            <textarea
              placeholder="내용을 입력하세요."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="
                w-[430px] h-[400px]
                border border-gray-400
                p-4 text-[18px]
                resize-none bg-white
              "
            />
          </div>
        </div>

        {/* 보내기 */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={() =>
              onSend?.({
                title,
                content: reply,
              })
            }
            disabled={!reply.trim() || !title.trim()}
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
