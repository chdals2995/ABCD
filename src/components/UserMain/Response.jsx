// src/components/userMain/Response.jsx
import Modal from "../../assets/Modal";
import CloseButton from "../../assets/CloseButton";

export default function Response({ open, onClose, request }) {
  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} closeOnBackdrop={true}>
      <div className="w-full h-full bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-[18px]">민원 상세</div>
          <CloseButton onClick={onClose} />
        </div>

        {!request ? (
          <div className="text-[14px] text-[#777]">데이터가 없습니다.</div>
        ) : (
          <div className="text-[14px] space-y-2">
            <div><b>제목:</b> {request.title}</div>
            <div><b>상태:</b> {request.status}</div>
            <div><b>유형:</b> {request.type}</div>
            <div><b>장소:</b> {request.floor}층 {request.room}호</div>
            <div className="pt-2"><b>내용</b></div>
            <div className="border p-3 w-[504px] h-[150px] whitespace-pre-wrap overflow-y-auto">{request.content}</div>

            <div className="pt-2"><b>답신</b></div>
            <div className="border p-3 h-[110px] w-[504px] whitespace-pre-wrap overflow-y-auto">
              {request.reply ? request.reply : "아직 답신이 없습니다."}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
