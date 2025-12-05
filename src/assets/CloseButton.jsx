export default function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[41px] h-[41px] flex items-center justify-center border-[1px]"
    >
      {/* 대각선 / */}
      <div
        className="
          absolute
          w-[32px] h-[4px]
          bg-black rounded-lg
          rotate-45
        "
      />

      {/* 대각선 \ */}
      <div
        className="
          absolute
          w-[32px] h-[4px]
          bg-black rounded-lg
          -rotate-45
        "
      />
    </button>
  );
}
