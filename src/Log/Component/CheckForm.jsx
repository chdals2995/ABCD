import { useState } from "react";
import AttachmentIcon from "../../icons/attachment_icon.png";
import Button from "../../assets/Button";
import CloseIcon from "../../assets/icons/close.png";


export default function CheckForm({
  onClose,
  title,
  mode = "create", // create = 입력, edit = 수정
  row,
  onSave,
}) {
  /* ---------------------- 상태 ---------------------- */

  const [editTitle, setEditTitle] = useState(
    mode === "edit" ? row?.title : title
  );

  const [content, setContent] = useState(
    mode === "edit" ? row?.content : ""
  );

  const [status, setStatus] = useState(
    mode === "edit" ? row?.status : "미완료"
  );

  const [isEditing, setIsEditing] = useState(mode === "create");

  const buttonLabel =
    mode === "edit"
      ? isEditing
        ? "저장"
        : "수정"
      : "저장";

  /* ---------------------- 저장 ---------------------- */
  const handleSave = () => {
    if (mode === "edit" && !isEditing) {
      setIsEditing(true);
      return;
    }

    const payload = {
      id: row?.id || null,
      title: editTitle,
      content,
      status: mode === "edit" ? status : "미완료",
    };

    onSave?.(payload);
    onClose();
  };

  /* ---------------------- UI ---------------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
      {/* 모달 박스 */}
      <div className="bg-white rounded-xl p-8 w-[620px] min-h-[650px] relative shadow-xl">

        {/* 닫기버튼 */}
         <img
          src={CloseIcon}
          className="w-[28px] absolute top-4 right-4 cursor-pointer hover:opacity-70"
          onClick={onClose}
        />

        {/* 제목 */}
        <div className="text-center mb-5 mt-2">
          <input
            type="text"
            className="text-[26px] font-bold text-center border-b pb-1 outline-none w-[350px]"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />

          {mode === "create" && (
            <p className="text-gray-500 text-[13px] mt-1">
              제목을 클릭하여 수정할 수 있어요.
            </p>
          )}
        </div>

        {/* 파란 박스 */}
        <div className="bg-[#E7EFF4] w-full min-h-[450px] p-6 rounded-lg flex flex-col mt-4">

          {/* 담당자 */}
          <p className="text-[18px] ml-2 mt-10 ">담당자: 홍길동</p>

          {/* 첨부파일 */}
          <div className="flex items-center gap-2 mt-4 ml-2">
            <p className="text-[18px]">첨부파일: 사진,영상,문서,스크린샷</p>

            <label htmlFor="fileUpload" className="cursor-pointer">
              <img src={AttachmentIcon} className="w-[26px]" />
            </label>

            <input id="fileUpload" type="file" className="hidden" />
          </div>

          {/* 상태 (edit 모드에만 보임) */}
          {mode === "edit" && (
            <div className="mt-6 ml-1">
              <p className="text-[18px] mb-2">상태</p>

              <select
                className="border px-3 py-2 text-[17px]"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={!isEditing}
              >
                <option value="미완료">미완료</option>
                <option value="완료">완료</option>
              </select>
            </div>
          )}

          {/* 내용 */}
          <textarea
            className="
              w-full h-[250px] border text-[18px]
              bg-white resize-none overflow-y-auto mt-6 ml-1
              placeholder:text-center placeholder:pt-[20%]
            "
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />
        </div>

        {/* 저장버튼 */}
        <div className="flex justify-center mt-8">
          <Button onClick={handleSave}>저장</Button>
        </div>

      </div>
    </div>
  );
}
