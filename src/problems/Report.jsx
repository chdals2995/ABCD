// src/problems/Report.jsx
import { useState, useMemo, useRef } from "react";
import { ref, push, set } from "firebase/database";
import { rtdb, storage } from "../firebase/config.js";
import { uploadBytes, getDownloadURL, ref as storageRef } from "firebase/storage";

import { toast } from "react-toastify";

// 아이콘
import FilterIcon from "../icons/filter_icon.png";
import AttachIcon from "../icons/attach_icon.png";
import CloseIcon from "../assets/icons/close.png";

// 버튼
import Button from "../assets/Button.jsx";

export default function Report({ onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [floor, setFloor] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [problemDate, setProblemDate] = useState(today); // ✅ 필드명 통일
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================
     층수 계산
  ========================= */
  const maxFloor = useMemo(() => {
    if (buildingType === "본관") return 20;
    if (buildingType === "주차타워") return 35;
    return 35;
  }, [buildingType]);

  const floorOptions = useMemo(() => {
    return Array.from({ length: maxFloor }, (_, i) => i + 1);
  }, [maxFloor]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  /* =========================
     Firebase 저장
  ========================= */
  const saveProblem = async () => {
    if (saving) return;

    if (!type || !buildingType || !floor || !content.trim() || !problemDate) {
      toast.error("입력되지 않은 값이 있습니다.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      setSaving(true);

      /* 파일 업로드 */
      const uploadedUrls = [];
      for (const file of files) {
        const fileRef = storageRef(
          storage,
          `problems/${Date.now()}_${file.name}`
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);
      }

      /* 데이터 */
      const problemDataBase = {
        type,
        buildingType,
        floor,
        location: `${buildingType} ${floor}`,
        content: content.trim(),

        // ✅ ProblemsLog에서 사용하는 날짜
        problemDate,

        images: uploadedUrls,
        createdAt: Date.now(),
        status: "미완료",
      };

      const listRef = ref(rtdb, `problems/${type}`);
      const newRef = push(listRef);
      await set(newRef, { ...problemDataBase, id: newRef.key });

      toast.success("문제가 저장되었습니다.", {
        position: "top-center",
        autoClose: 1500,
      });

      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error("저장 중 오류가 발생했습니다.", {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex justify-center items-center
       bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#E6EEF2] p-4 shadow-xl relative w-[660px] h-[700px]"
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 bg-white z-10"
        >
          <img src={CloseIcon} className="w-[20px] h-[20px]" />
        </button>

        <div className="bg-white w-[580px] h-[610px] rounded-3xl p-6 mt-5 shadow-md ml-5">
          <h2 className="text-center text-[16px] font-semibold mb-4">
            문제를 입력하고 저장할 수 있습니다.
          </h2>

          {/* 날짜 */}
          <div className="flex justify-center mt-10 mb-6 text-[16px] items-center">
            <span className="font-medium mr-2">날짜:</span>
            <input
              type="date"
              value={problemDate}
              onChange={(e) => setProblemDate(e.target.value)}
              className="px-2 py-1 text-[15px] border-0 outline-none bg-transparent"
            />
          </div>

          {/* 항목 + 장소 */}
          <div className="flex justify-center gap-8 mb-9">
            {/* 항목 */}
            <div className="flex flex-col">
              <label className="mb-1 text-[15px] font-medium">항목</label>
              <div className="relative w-[140px]">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-black px-3 py-1.5 pr-8 rounded text-[15px] appearance-none outline-none bg-transparent"
                >
                  <option value="">선택</option>
                  <option value="전력">전력</option>
                  <option value="온도">온도</option>
                  <option value="수도">수도</option>
                  <option value="가스">가스</option>
                </select>
                <img
                  src={FilterIcon}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none"
                />
              </div>
            </div>

            {/* 장소 */}
            <div className="flex flex-col">
              <label className="mb-1 text-[15px] font-medium">장소</label>

              <div className="flex gap-2">
                <div className="relative w-[140px]">
                  <select
                    value={buildingType}
                    onChange={(e) => {
                      setBuildingType(e.target.value);
                      setFloor("");
                    }}
                    className="w-full border border-black px-3 py-1.5 pr-8 rounded text-[15px] appearance-none outline-none bg-transparent"
                  >
                    <option value="">선택</option>
                    <option value="본관">본관</option>
                    <option value="주차타워">주차타워</option>
                  </select>
                  <img
                    src={FilterIcon}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none"
                  />
                </div>

                <div className="relative w-[100px]">
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full border border-black px-3 py-1.5 pr-8 rounded text-[15px] appearance-none outline-none bg-transparent"
                  >
                    <option value="">층</option>
                    {floorOptions.map((f) => (
                      <option key={f} value={`${f}층`}>
                        {f}층
                      </option>
                    ))}
                  </select>
                  <img
                    src={FilterIcon}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 첨부파일 */}
          <div className="mb-5 text-[15px] flex items-center">
            <label className="font-medium mr-2">첨부파일 :</label>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <div className="text-[13px] min-w-[220px] px-2 py-1.5 border border-gray-300 rounded">
                {files.length === 0
                  ? "선택된 파일 없음"
                  : files.map((f) => f.name).join(", ")}
              </div>

              <img
                src={AttachIcon}
                className="w-[16px] h-[16px] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
            </div>
          </div>

          {/* 문제 내용 */}
          <div className="flex flex-col mb-6">
            <label className="mb-1 text-[15px] font-medium">문제 내용</label>
            <textarea
              className="border-2 border-black rounded-xl p-3 h-[200px] text-[15px]"
              placeholder="문제 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <Button onClick={saveProblem}>
              {saving ? "저장중..." : "저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
