// src/compopnent/data/Smodal.jsx
export default function DataModal({
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
             border-[3px] border-[#054E76]
            bg-[#E7F3F8]
            flex flex-col
            max-w-[calc(100vw-40px)]
            max-h-[calc(100vh-40px)]
            w-[1154.16px] h-[749px]
          `}
        >
          {children}
        </div>
      </div>
    </>
  );
}