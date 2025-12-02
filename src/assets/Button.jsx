export default function Button({ func, name }) {
  return (
    <>
      <button
        onClick={func}
        className="w-[79px] h-[47px] rounded-[10px] bg-[#054E76] text-white text-[20px] flex items-center justify-center"
      >
        {name}
      </button>
    </>
  );
}
