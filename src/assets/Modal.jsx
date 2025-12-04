// src/assets/Modal.jsx (실제 경로에 맞게)
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
    <>
      {/* 회색 배경 오버레이 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* 가운데 정렬 컨테이너 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`
            pointer-events-auto
            rounded-[18px] border-[3px] border-[#054E76]
            bg-[#e6eef2]
            flex flex-col
            max-w-[calc(100vw-40px)]
            max-h-[calc(100vh-40px)]
            w-[558px] h-[562px]
          `}
        >
          {children}
        </div>
      </div>
    </>
  );
}
