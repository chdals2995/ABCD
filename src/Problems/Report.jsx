// Report.jsx
import { useState } from "react";
import { ref, push } from "firebase/database";
import { rtdb, storage } from "../firebase/config";
import { uploadBytes, getDownloadURL, ref as storageRef } from "firebase/storage";
// 아이콘들 
import FilterIcon from "../icons/filter_icon.png";
import AttachIcon from "../icons/attach_icon.png";
import CloseIcon from "../assets/icons/close.png";

// 공용 버튼
import Button from "../assets/Button.jsx";

export default function Report({ onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [date, setDate] = useState(today); // 날짜도 함께 저장할 상태

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  //  문제 저장 + 파일 업로드
  const saveProblem = async () => {
    if (!type || !location || !content || !date) {
      alert("입력되지 않은 값이 있습니다.");
      return;
    }

    try {
      // 1) 첨부파일 업로드
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

      // 2) RTDB에 데이터 저장
      const problemData = {
        type,
        location,
        content,
        date,
        images: uploadedUrls,
        createdAt: Date.now(),
        status: "미완료",
      };

      await push(ref(rtdb, "problems"), problemData);

      alert("문제가 저장되었습니다.");

      // 3) 입력값 리셋
      setType("");
      setLocation("");
      setContent("");
      setFiles([]);
      setDate(today);
    } catch (err) {
      console.error(err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className="
        fixed inset-0 flex justify-center items-center 
        bg-[rgba(0,0,0,0.35)] z-[9999]
      "
    >
      {/* 바깥 파란 배경 */}
      <div className="bg-[#E6EEF2] p-6  shadow-xl relative w-[800px] h-[830px]">

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 bg-white"
        >
          <img src={CloseIcon} className="w-17.24 h-17.24" />
        </button>

        {/* 내부 흰 박스 */}
        <div className="bg-white w-[700px] h-[730px] rounded-3xl p-10 mt-8 shadow-md ml-5">

          {/* 제목 */}
          <h2 className="text-center text-lg font-semibold mb-6">
            문제를 입력하고 저장할 수 있음
          </h2>

          {/* 날짜 */}
        <div className="flex justify-center mb-8 text-[20px] items-center">
        <span className="font-medium mr-3">날짜:</span>

        <input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
  className="
    px-3 py-2 text-[18px]
    border-[0px]
    outline-none
    focus:outline-none
    focus:ring-0
    bg-transparent
  "
  style={{
    border: "none",
    WebkitAppearance: "none",
  }}
/>
        </div>


          {/* 항목 + 장소 */}
          <div className="flex justify-center gap-12 mb-10">

            {/* 항목 */}
            <div className="flex flex-col">
              <label className="mb-2 text-[18px] font-medium">항목</label>

              <div className="flex border border-black px-4 py-2 rounded items-center gap-3">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="outline-none text-[18px]"
                >
                  <option>선택</option>
                  <option value="전력">전력</option>
                  <option value="온도">온도</option>
                  <option value="수도">수도</option>
                  <option value="가스">가스</option>
                </select>

                <img src={FilterIcon} className="w-[22px] h-[22px]" />
              </div>
            </div>

            {/* 장소 */}
            <div className="flex flex-col">
              <label className="mb-2 text-[18px] font-medium">장소</label>

              <div className="flex border border-black px-4 py-2 rounded items-center gap-3 w-[250px]">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="outline-none text-[18px] flex-1"
                >
                  <option>선택</option>
                </select>

                <img src={FilterIcon} className="w-[22px] h-[22px]" />
              </div>
            </div>
          </div>

        {/* 첨부파일 */}
        <div className="mb-8 text-[18px] flex items-center">
          <label className="font-medium mr-2">첨부파일 :</label>

        <div className="flex items-center gap-3">

        {/* 실제 input(숨김 처리) */}
        <input
            id="report-file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
        />

        {/* 파일 이름 보여주는 박스 */}
        <div className="
            text-[16px] min-w-[260px] 
            px-3 py-2 border border-gray-300
            rounded bg-white">
        {files.length === 0
            ? "선택된 파일 없음"
            : files.map((f) => f.name).join(", ")}
        </div>

        {/* 첨부 아이콘 */}
        <img
            src={AttachIcon}
            className="w-[20px] h-[20px] cursor-pointer"
            onClick={() => document.querySelector("#report-file-input").click()}
        />
      </div>
    </div>


          {/* 문제 내용 */}
          <div className="flex flex-col mb-12">
            <label className="mb-3 text-[18px] font-medium">문제 내용</label>

            <textarea
              className="border-2 border-black rounded-xl p-5 h-[200px] text-[18px]"
              placeholder="문제 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-center">
            <Button onClick={saveProblem}>
              저장
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
