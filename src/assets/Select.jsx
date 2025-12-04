// src/components/Select.jsx
export default function Select({
  label, // 위에 보일 라벨 (선택 사항)
  value, // 선택된 값 (부모에서 관리)
  onChange, // 값이 바뀔 때 호출되는 함수
  options, // [{ value: "...", label: "..." }, ...]
  placeholder = "선택하세요", // 첫 줄 안내 문구
  className = "", // 필요하면 추가 Tailwind 클래스
  ...rest // disabled, required 같은 나머지 props
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-gray-700">{label}</span>
      )}

      <select
        value={value}
        onChange={onChange}
        className="
          w-[120px]
          h-[30px]
          rounded-[10px]
          border border-[#0888D4]
          bg-white
          px-3 py-2
          text-sm
          outline-none
          focus:border-[#0888D4]
          focus:ring-2
          focus:ring-[#0888d4]/30
          cursor-pointer
          text-black
        "
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
