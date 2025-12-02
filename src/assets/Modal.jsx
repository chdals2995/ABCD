// src/components/Modal.jsx
export default function Modal({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
}) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closeOnBackdrop && onClose) onClose();
  };

  return (
    // 전체 화면 덮는 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* 🔵 파란 테두리 박스: 크기는 children(내용)에 맞춰서 자동 */}
      <div
        className="
          rounded-[18px] border-[8px] border-[#0888D4]
          bg-[#054E76]/10
          p-6
          max-w-[calc(100vw-40px)]  /* 화면 밖으로 나가지 않게만 제한 */
        "
        onClick={(e) => e.stopPropagation()} // 안쪽 클릭은 닫힘 막기
      >
        {children}
      </div>
    </div>
  );
}
