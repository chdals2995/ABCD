import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { rtdb } from "../../firebase/config";

export default function AddRequest() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState("");

  const addRequest = (e) => {
    e.preventDefault();

    if (!title || !content || !date || !building || !floor || !type) {
      alert("모든 필드를 채워주세요!");
      return;
    }

    const newRequest = {
      title,
      content,
      date,
      building,          // main | tower
      floor,             // 1F ~ 20F
      type,              // 전기 | 온도 | 수도 | 가스
      status: "접수",
      createdAt: Date.now(),
    };

    push(ref(rtdb, "requests"), newRequest)
      .then(() => {
        alert("요청이 추가되었습니다!");
      })
      .catch((err) => {
        console.error(err);
        alert("요청 추가 중 오류 발생");
      });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        새로운 요청 추가
      </h2>

      <form onSubmit={addRequest} className="space-y-5">

        {/* 제목 */}
        <input
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded"
        />

        {/* 날짜 */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border rounded"
        />

        {/* 건물 */}
        <select
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">건물 선택</option>
          <option value="main">건물</option>
          <option value="tower">주차타워건물</option>
        </select>

        {/* 층 */}
        <select
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">층 선택</option>
          {Array.from({ length: 20 }, (_, i) => (
            <option key={i + 1} value={`${i + 1}F`}>
              {i + 1}F
            </option>
          ))}
        </select>

        {/* 항목 */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option value="">항목 선택</option>
          <option value="전력">전력</option>
          <option value="온도">온도</option>
          <option value="수도">수도</option>
          <option value="가스">가스</option>
        </select>

        {/* 내용 */}
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded h-[120px]"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded"
        >
          요청 추가
        </button>
      </form>
    </div>
  );
}
