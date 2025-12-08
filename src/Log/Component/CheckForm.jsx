import { useState } from "react";
import AttachmentIcon from "../../icons/attachment_icon.png";

export default function CheckForm({
  onClose,
  title,
  mode = "create", // create = 입력, edit = 수정
  row,
  onSave,
}) {
  /* ---------------------- 상태 ---------------------- */

  // 제목
  const [editTitle, setEditTitle] = useState(
    mode === "edit" ? row?.title : title
  );

  // 내용
  const [content, setContent] = useState(
    mode === "edit" ? row?.content : ""
  );

  // edit 모드: "수정 → 저장" 버튼 토글
  const [isEditing, setIsEditing] = useState(mode === "create");

  const buttonLabel = isEditing ? "저장" : "수정";

  /* ---------------------- 저장 처리 ---------------------- */
  const handleSave = () => {
    if (!isEditing) {
      // 수정 버튼 → 저장 가능 상태로
      setIsEditing(true);
      return;
    }

    const payload = {
      title: editTitle,
      content,
      id: row?.id || null,
    };

    if (onSave) onSave(payload);

    onClose();
  };

  const isTitleEditable = mode === "create";

  /* ---------------------- UI ---------------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
      <div className="bg-white rounded-xl p-10 w-[825px] h-[812px] relative shadow-xl">
        
        {/* 닫기 버튼 */}
        <button
          className="absolute top-5 right-5 text-[28px]"
          onClick={onClose}
        >
          ✕
        </button>

        {/* 제목 */}
        <div className="text-center mb-6">
          {isTitleEditable ? (
            <input
              type="text"
              className="text-[28px] font-bold text-center border-b pb-1 outline-none w-[350px]"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <h2 className="text-[28px] font-bold">{editTitle}</h2>
          )}

          {mode === "create" && (
            <p className="text-gray-500 text-[14px] mt-1">
              제목을 클릭하여 수정할 수 있어요.
            </p>
          )}
        </div>

        {/* 파란 박스 */}
        <div className="flex justify-center">
          <div className="bg-[#E7EFF4] w-[636px] h-[562px] p-10 rounded-lg flex flex-col">

            {/* 담당자 */}
            <p className="mt-5 ml-5 text-[20px]">담당자: 홍길동</p>

            {/* 첨부파일 */}
            <div className="flex items-center gap-2 mt-5 ml-5">
              <p className="text-[20px]">
                첨부파일: 사진,영상,문서,스크린샷
              </p>

              <label htmlFor="fileUpload" className="cursor-pointer">
                <img src={AttachmentIcon} className="w-[28px]" />
              </label>

              <input id="fileUpload" type="file" className="hidden" />
            </div>

            {/* 내용 */}
            <textarea
              className="
                w-[530px] h-[319px] border text-[20px]
                bg-white resize-none overflow-y-auto mt-20 ml-5
                placeholder:text-center placeholder:pt-[140px]
              "
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={mode === "edit" && !isEditing}
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-center mt-8">
          <button
            className="px-10 py-3 border rounded text-[18px]"
            onClick={handleSave}
          >
            {buttonLabel}
          </button>
        </div>

      </div>
    </div>
  );
}
