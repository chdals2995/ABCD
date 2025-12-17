// CheckForm.jsx
import { useState } from "react";
import AttachmentIcon from "../assets/icons/attachment_icon.png";
import CloseIcon from "../assets/icons/close.png";
import Button from "../assets/Button";

export default function CheckForm({
  onClose,
  title,
  mode = "create", // create | edit | view
  row,
  onSave,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  /* =========================
     edit / create 전용 state
     (🔥 view 모드에서는 사용 안 함)
  ========================= */
  const [editTitle, setEditTitle] = useState(row?.title || title || "");
  const [checkDate, setCheckDate] = useState(row?.date ?? "");
  const [content, setContent] = useState(row?.content || "");
  const [checkType, setCheckType] = useState(row?.checkType ?? "상시");

  // edit 모드에서만 수정 토글
  const [isEditing, setIsEditing] = useState(mode === "create");

  /* =========================
     실제 표시 값 (view / edit 분리)
  ========================= */
  const displayTitle = isView ? row?.title || "" : editTitle;
  const displayDate = isView ? row?.date || "" : checkDate;
  const displayContent = isView ? row?.content || "" : content;
  const displayCheckType = isView ? row?.checkType || "상시" : checkType;

  /* =========================
     버튼 텍스트
  ========================= */
  const buttonLabel = (() => {
    if (isView) return "확인";
    if (isEdit) return isEditing ? "저장" : "수정";
    return "저장";
  })();

  /* =========================
     버튼 동작
  ========================= */
  const handleSave = () => {
    // view 모드 → 닫기만
    if (isView) {
      onClose();
      return;
    }

    // edit 모드 첫 클릭 → 수정 활성화
    if (isEdit && !isEditing) {
      setIsEditing(true);
      return;
    }

    const payload = {
      id: row?.id || null,
      title: editTitle,
      content,
      date: checkDate,
      status: isEdit ? row?.status : "미완료",
      checkType,
    };

    onSave?.(payload);
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
            value={displayTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={isView || (isEdit && !isEditing)}
          />
        </div>

        {/* 내용 영역 */}
        <div className="bg-[#E6EEF2] w-full h-[440px] p-6 rounded-lg flex flex-col mt-4">
          <p className="text-[18px] ml-1">담당자: 홍길동</p>

          {/* 첨부파일 */}
          <div className="flex items-center gap-2 mt-4 ml-1">
            <p className="text-[18px]">첨부파일</p>
            {!isView && (
              <>
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <img src={AttachmentIcon} className="w-[26px]" />
                </label>
                <input id="fileUpload" type="file" className="hidden" />
              </>
            )}
          </div>

          {/* 점검 날짜 */}
          <div className="mt-4 ml-1">
            <p className="text-[18px] mb-1">점검 날짜</p>
            <input
              type="date"
              className="border px-3 py-2 text-[17px] bg-white"
              value={displayDate}
              onChange={(e) => setCheckDate(e.target.value)}
              disabled={isView || (isEdit && !isEditing)}
            />
          </div>

          {/* 점검 구분 */}
          <div className="mt-4 ml-1">
            <p className="text-[18px] mb-1">점검</p>
            <select
              className="border px-3 py-2 text-[17px] bg-white w-[140px]"
              value={displayCheckType}
              onChange={(e) => setCheckType(e.target.value)}
              disabled={isView || (isEdit && !isEditing)}
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
            value={displayContent}
            onChange={(e) => setContent(e.target.value)}
            disabled={isView || (isEdit && !isEditing)}
          />
        </div>

        {/* 안내 문구 */}
        {isEdit && !isEditing && (
          <p className="text-gray-500 text-[16px] mt-2 text-center">
            수정하려면 아래의 ‘수정’ 버튼을 눌러주세요.
          </p>
        )}

        {isView && (
          <p className="text-gray-500 text-[16px] mt-2 text-center">
            요청 내역 확인 화면입니다.
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
