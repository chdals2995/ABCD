// src/components/userMain/NoticeDetail.jsx
import { useEffect } from "react";
import CloseButton from "../../assets/CloseButton";
import Button from "../../assets/Button";

export default function NoticeDetail({ isOpen, onClose, notice }) {
  // ✅ ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // ✅ Backdrop (화면 전체)
    <div className="fixed inset-0 z-[9999]">
      {/* ✅ 배경(클릭 시 닫기) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* ✅ 가운데 정렬 래퍼 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* ✅ 실제 모달(배경 클릭이 모달에 전달되지 않도록 stopPropagation) */}
        <div
          className="relative w-[760px] bg-[#E4EDF0] border-[3px] border-[#054E76]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X */}
          <div className="absolute right-[12px] top-[12px]">
            <CloseButton onClick={onClose} />
          </div>

          <h2 className="text-center font-pyeojin font-bold text-[22px] pt-[26px]">
            공지사항
          </h2>

          <div className="mx-auto mt-[16px] w-[600px] bg-white rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.2)] p-[22px]">
            <div className="text-[14px] space-y-3">
              <div className="flex gap-3">
                <div className="w-[60px] text-gray-600">제목</div>
                <div className="flex-1">{notice?.title ?? ""}</div>
              </div>

              <div className="flex gap-3">
                <div className="w-[60px] text-gray-600">날짜</div>
                <div className="flex-1">{notice?.dateLabel ?? ""}</div>
              </div>

              <div className="flex gap-3">
                <div className="w-[60px] text-gray-600">내용</div>
                <textarea
                  readOnly
                  value={notice?.content ?? ""}
                  className="flex-1 h-[180px] border border-[#D1D5DB] p-3 resize-none outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center py-[18px]">
            <Button onClick={onClose}>확인</Button>
          </div>
        </div>
      </div>
    </div>
  );
}