import React, { useState } from "react";
import { ref, push } from "firebase/database";
import { rtdb } from "../../firebase/config"; // Firebase 설정 파일에서 rtdb 가져오기


export default function AddRequest() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("");


  // 새로운 요청 추가 함수
  const addRequest = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로 고침 방지


    if (!title || !content || !floor || !room || !type) {
      alert("모든 필드를 채워주세요!");
      return;
    }


    const newRequest = {
      title,
      content,
      status: "접수", // 초기 상태
      floor,
      room,
      type,
      createdAt: Date.now(), // 요청 생성 시간
    };


    const requestsRef = ref(rtdb, "requests"); // Firebase의 'requests' 경로
    push(requestsRef, newRequest) // 데이터를 추가
      .then(() => {
        console.log("새로운 요청이 추가되었습니다.");
        alert("요청이 추가되었습니다!");
      })
      .catch((error) => {
        console.error("요청 추가 중 오류 발생:", error);
      });
  };


  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">새로운 요청 추가</h2>
      <form onSubmit={addRequest} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-2">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>


        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-600 mb-2">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>


        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-gray-600 mb-2">
            층
          </label>
          <input
            id="floor"
            type="text"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>


        <div>
          <label htmlFor="room" className="block text-sm font-medium text-gray-600 mb-2">
            방 번호
          </label>
          <input
            id="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>


        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-600 mb-2">
            요청 유형
          </label>
          <input
            id="type"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>


        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          요청 추가
        </button>
      </form>
    </div>
  );
}
