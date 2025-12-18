import { useState, useEffect } from "react";
import CloseIcon from "../assets/icons/close.png";
import Button from "../assets/Button";

export default function RequestArrival({
  data,
  onClose,
  mode = "view", // "view" | "reply"
  onSend,        // reply 모드에서만
  onReply,       // view 모드에서만
}) {
  const isReply = mode === "reply";

  const [reply, setReply] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!data?.title) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(data.title);
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[630px] h-[710px] border-[5px] border-[#054E76] rounded-xl bg-[#DCE6EB] relative p-10">
        {/* 닫기 */}
        <img
          src={CloseIcon}
          className="absolute top-4 right-4 w-[28px] cursor-pointer"
          onClick={onClose}
        />

        {/* 타이틀 */}
        <h2 className="text-[26px] font-bold text-center text-[#054E76] mb-6">
          {isReply ? "Re: 요청사항" : "불편 사항"}
        </h2>

        <div className="bg-white w-[540px] h-[490px] mx-auto rounded-lg p-6 shadow-lg flex flex-col items-center">
          {/* 제목 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">제목 :</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={!isReply}
              className={`
                border border-gray-400 px-2 py-1 w-[330px] text-[17px]
                ${isReply ? "bg-white" : "bg-gray-100 cursor-default"}
              `}
            />
          </div>

          {/* 일시 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">일시 :</span>
            <input
              type="date"
              value={data.date}
              readOnly
              className="border border-gray-400 px-2 py-1 w-[330px] text-[17px] bg-gray-100 cursor-default"
            />
          </div>

          {/* 장소 */}
          <div className="mb-3 flex items-center justify-center">
            <span className="mr-3 text-[18px] font-medium">장소 :</span>

            <select
              value={data.building ?? ""}
              disabled
              className="border border-gray-400 px-2 py-1 w-[150px] text-[17px] bg-gray-100 cursor-default"
            >
              <option value="main">건물</option>
              <option value="tower">주차타워건물</option>
            </select>

            <select
              value={data.floor ?? ""}
              disabled
              className="border border-gray-400 px-2 py-1 w-[120px] text-[17px] bg-gray-100 cursor-default ml-2"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((f) => (
                <option key={f} value={`${f}F`}>
                  {f}F
                </option>
              ))}
            </select>
          </div>

          {/* 항목 */}
          <div className="mb-3 text-[18px] flex justify-center">
            <span className="font-medium mr-3">항목 :</span>
            {["전기", "온도", "수도", "가스"].map((t) => (
              <label key={t} className="mr-4">
                <input type="radio" checked={data.type === t} disabled /> {t}
              </label>
            ))}
          </div>

          {/* 원문 */}
          <div className="mt-4 flex flex-col items-center w-full">
            <textarea
              value={data.content}
              readOnly
              className="border border-[#1A6CA8] resize-none mt-2 w-[390px] h-[160px] p-3 text-[17px] bg-gray-100 cursor-default"
            />
          </div>

          {/* 답장 */}
          {isReply && (
            <div className="mt-4 flex flex-col items-center w-full">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="답변 내용을 입력하세요"
                className="border border-[#054E76] resize-none mt-2 w-[390px] h-[120px] p-3 text-[17px]"
              />
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="w-full flex justify-center mt-6">
          {isReply ? (
            <Button
              onClick={() => {
                onSend?.({
                  title,
                  content: reply,
                });
                onClose();
              }}
              disabled={!reply.trim() || !title.trim()}
            >
              <span className="whitespace-nowrap">보내기</span>
            </Button>
          ) : (
            <Button onClick={() => onReply?.()}>
              <span className="whitespace-nowrap">답장</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
