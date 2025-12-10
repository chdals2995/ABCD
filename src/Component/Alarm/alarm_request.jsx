import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../firebase/config"; // Firebase 설정 파일에서 rtdb 가져오기


export default function AlarmRequest() {
  const [items, setItems] = useState([]); // 알람 데이터 저장 상태
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 순서 상태


  // Firebase에서 데이터를 실시간으로 읽어오는 useEffect
  useEffect(() => {
    const requestsRef = ref(rtdb, "requests"); // Firebase의 'requests' 경로에서 데이터 읽기


    // Firebase에서 실시간으로 데이터 읽기
    return onValue(requestsRef, (snapshot) => {
      const data = snapshot.val(); // 데이터 가져오기
      if (!data) {
        setItems([]); // 데이터가 없으면 빈 배열로 설정
        return;
      }


      // 데이터를 원하는 형태로 가공
      const list = Object.entries(data).map(([id, v]) => ({
        id,
        title: v.title || "",
        content: v.content || "",
        status: v.status || "접수",
        floor: v.floor || "",
        room: v.room || "",
        createdAt: Number(v.createdAt) || 0, // createdAt 값이 없으면 0으로 처리
      }));


      setItems(list); // 상태에 데이터 저장
    });
  }, []); // 빈 배열을 넣어서 컴포넌트 마운트 시 한 번만 실행


  // 정렬 로직 (최신순, 오래된순)
  const sorted = [...items].sort((a, b) =>
    sortOrder === "latest" // 최신순
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt // 오래된순
  );


  return (
    <div className="w-[335px] h-[698px] pt-[20px] px-[15px] bg-white">
      {/* 정렬 버튼 */}
      <div className="flex justify-end mb-[10px] gap-[10px] text-[14px]">
        <button
          onClick={() => setSortOrder("latest")}
          className={`${sortOrder === "latest" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          최신순
        </button>


        <span className="text-gray-400">|</span>


        <button
          onClick={() => setSortOrder("old")}
          className={`${sortOrder === "old" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
        >
          오래된순
        </button>
      </div>


      {/* 알람 리스트 */}
      <div className="flex flex-col gap-4"> {/* 항목들 간 간격을 4로 설정 */}
        {sorted.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-300">
            {/* 왼쪽: 제목 및 내용 */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 "></span> {/* 상태에 따른 색상 적용 */}
              <span className="text-[16px] font-medium">
                {item.title || item.content} {/* 제목이 없으면 내용 표시 */}
              </span>
            </div>


            {/* 오른쪽: 상태별 색상 */}
            <span
              className={`text-[14px] font-semibold
                ${item.status === "접수" ? "text-green-600" : ""}
                ${item.status === "처리중" ? "text-orange-500" : ""}
                ${item.status === "완료" ? "text-blue-600" : ""}
              `}
            >
              {item.status} {/* 상태 값 표시 */}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
