// CheckForm.jsx
import { useState } from "react";
import AttachmentIcon from "../assets/icons/attachment_icon.png";
import CloseIcon from "../assets/icons/close.png";
import Button from "../assets/Button";

export default function CheckForm({
  onClose,
  title,
  mode = "create",   // create | edit
  row,
  onSave,
}) {
  const [editTitle, setEditTitle] = useState(
    mode === "edit" ? row?.title : title
  );

  // 날짜
  const [checkDate, setCheckDate] = useState(
    mode === "edit" ? row?.date ?? "" : ""
  );

  const [content, setContent] = useState(
    mode === "edit" ? row?.content : ""
  );

  // 상시 / 정기
  const [checkType, setCheckType] = useState(
    mode === "edit" ? row?.checkType ?? "상시" : "상시"
  );

  // 수정 모드 제어
  const [isEditing, setIsEditing] = useState(mode === "create");

  const buttonLabel =
    mode === "edit"
      ? isEditing
        ? "저장"
        : "수정"
      : "저장";

  const handleSave = () => {
    // edit 모드에서 처음 클릭 → 수정 가능 상태로만 전환
    if (mode === "edit" && !isEditing) {
      setIsEditing(true);
      return;
    }

    const payload = {
      id: row?.id || null,
      title: editTitle,
      content,
      date: checkDate,
      status: mode === "edit" ? row?.status : "미완료",
      checkType,
    };

    onSave && onSave(payload);
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0
        flex justify-center items-center
        z-[999]
        backdrop-blur-sm
        bg-black/20
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white rounded-xl
          p-8 w-[620px] min-h-[650px]
          relative shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 */}
        <img
          src={CloseIcon}
          className="w-[28px] absolute top-4 right-4 cursor-pointer hover:opacity-70"
          onClick={onClose}
        />

        {/* 제목 */}
        <div className="text-center mb-4 mt-2">
          <input
            type="text"
            className="
              text-[26px] font-bold text-center
              border-b pb-1 outline-none
              w-[350px]
            "
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />
        </div>

        {/* 내용 영역 */}
        <div className="bg-[#E6EEF2] w-full h-[440px] p-6 rounded-lg flex flex-col mt-4">
          <p className="text-[18px] ml-1">담당자: 홍길동</p>

          {/* 첨부파일 */}
          <div className="flex items-center gap-2 mt-4 ml-1">
            <p className="text-[18px]">첨부파일</p>
            <label htmlFor="fileUpload" className="cursor-pointer">
              <img src={AttachmentIcon} className="w-[26px]" />
            </label>
            <input id="fileUpload" type="file" className="hidden" />
          </div>

          {/* 점검 날짜 */}
          <div className="mt-4 ml-1">
            <p className="text-[18px] mb-1">점검 날짜</p>
            <input
              type="date"
              className="border px-3 py-2 text-[17px] bg-white"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              disabled={mode === "edit" && !isEditing}
            />
          </div>

          {/* 점검 구분 */}
          <div className="mt-4 ml-1">
            <p className="text-[18px] mb-1">점검</p>
            <select
              className="border px-3 py-2 text-[17px] bg-white w-[140px]"
              value={checkType}
              onChange={(e) => setCheckType(e.target.value)}
              disabled={mode === "edit" && !isEditing}
            >
              <option value="상시">상시 점검</option>
              <option value="정기">정기 점검</option>
            </select>
          </div>

          {/* 내용 */}
          <textarea
            className="
              w-full h-[200px]
              border text-[18px]
              bg-white resize-none
              overflow-y-auto
              mt-6 ml-1
            "
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={mode === "edit" && !isEditing}
          />
        </div>

        {/* 안내 문구 */}
        {mode === "edit" && !isEditing && (
          <p className="text-gray-500 text-[16px] mt-2 text-center">
            수정하려면 아래의 ‘수정’ 버튼을 눌러주세요.
          </p>
        )}

        {/* 버튼 */}
        <div className="flex justify-center mt-8">
          <Button onClick={handleSave}>{buttonLabel}</Button>
        </div>
      </div>
    </div>
  );
}
