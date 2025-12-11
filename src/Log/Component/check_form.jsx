import { useState } from "react";
import AttachmentIcon from "../../icons/attachment_icon.png";
import CloseIcon from "../../assets/icons/close.png";
import Button from "../../assets/Button";

export default function CheckForm({
  onClose,
  title,
  mode = "create",
  row,
  onSave,
}) {
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
      ? isEditing ? "저장" : "수정"
      : "저장";

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

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[999]">
      <div className="bg-white rounded-xl p-8 w-[620px] min-h-[650px] relative shadow-xl">

        {/* 공통 닫기 아이콘 */}
        <img
          src={CloseIcon}
          className="w-[28px] absolute top-4 right-4 cursor-pointer hover:opacity-70"
          onClick={onClose}
        />

        {/* 제목 */}
        <div className="text-center mb-4 mt-2">
          <input
            type="text"
            className="text-[26px] font-bold text-center border-b pb-1 outline-none w-[350px]"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />

          {/* 안내문구 */}
          {mode === "edit" && !isEditing && (
            <p className="text-gray-500 text-[14px] mt-2">
              이 항목은 수정 가능합니다. 수정하려면 아래의 ‘수정’ 버튼을 눌러주세요.
            </p>
          )}
        </div>

        {/* 파란 박스 */}
        <div className="bg-[#E7EFF4] w-full min-h-[380px] p-6 rounded-lg flex flex-col mt-4">

          <p className="text-[18px] ml-1">담당자: 홍길동</p>

          <div className="flex items-center gap-2 mt-4 ml-1">
            <p className="text-[18px]">첨부파일: 사진,영상,문서,스크린샷</p>

            <label htmlFor="fileUpload" className="cursor-pointer">
              <img src={AttachmentIcon} className="w-[26px]" />
            </label>

            <input id="fileUpload" type="file" className="hidden" />
          </div>

          {/* 상태 (edit 전용) */}
          {mode === "edit" && (
            <>
              {!isEditing && (
                <p className="text-gray-400 text-[13px] ml-1 mt-4">
                  상태를 변경하려면 ‘수정’ 버튼을 눌러 편집 모드로 전환하세요.
                </p>
              )}

              <div className="mt-2 ml-1">
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
            </>
          )}

          {/* 내용 */}
          <textarea
            className="
              w-full h-[200px] border text-[18px]
              bg-white resize-none overflow-y-auto mt-6 ml-1
              placeholder:text-center placeholder:pt-[70px]
            "
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  );
}
