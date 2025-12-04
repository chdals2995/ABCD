import { useState } from "react";

export default function AlarmRequest() {

  const [sortOrder, setSortOrder] = useState("latest");

  const requestList = [
    { id: 12, title: "방 불이 안 켜져요", status: "접수" },
    { id: 11, title: "에어컨 바람이 안 나와요", status: "처리중" },
    { id: 10, title: "공동구역에 쓰레기가 쌓였어요", status: "완료" },
    { id: 9, title: "엘리베이터 작동이 이상해요", status: "처리중" },
    { id: 8, title: "복도에서 큰 소리가 나요", status: "접수" },
    { id: 7, title: "가스 냄새가 나요", status: "접수" },
    { id: 6, title: "수도에서 물이 안 나와요", status: "처리중" },
    { id: 5, title: "난방이 작동하지 않아요", status: "완료" },
    { id: 4, title: "전기가 간헐적으로 나가요", status: "접수" },
  ];

  const sortedList = [...requestList].sort((a, b) =>
  sortOrder === "latest" ? b.id - a.id : a.id - b.id
  );
  //리스트 정렬배열 만드는 함수 

  //리스트 접수별 현황 글자색 
  const statusColor = {
    "접수": "text-black",
    "처리중": "text-[#28B804]",
    "완료": "text-[#0888D4]"
  };

  return (
    <div className="w-[335px] h-[698px] pt-[79px] px-[15px] bg-white">

      {/* 🔥 최신순 ｜ 오래된순 */}
      <div className="flex justify-end mt-[-50px] mb-[40px] gap-[10px] text-[14px]">

        {/* 최신순 */}
        <button
          onClick={() => setSortOrder("latest")}
          className={`
            ${sortOrder === "latest" ? "font-bold text-[#054e76]" : "text-gray-500"}
            hover:underline
          `}
        >
          최신순
        </button>

        <span className="text-gray-400">|</span>

        {/* 오래된순 */}
        <button
          onClick={() => setSortOrder("old")}
          className={`
            ${sortOrder === "old" ? "font-bold text-[#054e76]" : "text-gray-500"}
            hover:underline
          `}
        >
          오래된순
        </button>

      </div>
            
      {/* 리스트 */}
      {sortedList.map((item, idx) => (
        <div key={idx} className="flex justify-between pb-[20px]">

      {/* ● + 제목 묶음 */}
      <div className="flex items-center gap-2">
        {item.status === "접수" && (
          <span className="
          w-2.5 h-2.5 bg-[#FF0004] rounded-full blink-dot">
          </span>
        )}

        <span className="text-[16px]">{item.title}</span>
      </div>

      {/* 상태 */}
      <span className={`text-[14px] ${statusColor[item.status]}`}>
        {item.status}
      </span>

</div>

      ))}

    </div>
  );
}


/* 
---------------------- 위에는 테스트 용 ---------------------
아래가 백엔드 (DB)를 받아와서 자동 업데이트 가능한 형태임 
*/


// import { useState, useEffect } from "react";

// export default function AlarmRequest() {

//   const [sortOrder, setSortOrder] = useState("latest");
//   const [requestList, setRequestList] = useState([]);     // 백엔드 데이터 저장
//   const [loading, setLoading] = useState(true);           // 로딩 상태
//   const [error, setError] = useState(null);               // 에러 상태

//   // 🔥 최초 렌더링 시 백엔드에서 데이터 가져오기
//   useEffect(() => {
//     async function fetchRequests() {
//       try {
//         const res = await fetch("/api/requests");  // 백엔드 주소
//         const data = await res.json();
//         setRequestList(data);
//       } catch (err) {
//         setError("데이터 불러오기에 실패했습니다.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchRequests();
//   }, []);

//   //  정렬된 데이터 만들기
//   const sortedList = [...requestList].sort((a, b) =>
//     sortOrder === "latest" ? b.id - a.id : a.id - b.id
//   );

//   // 상태별 컬러
//   const statusColor = {
//     "접수": "text-black",
//     "처리중": "text-[#28B804]",
//     "완료": "text-[#0888D4]"
//   };

//   //  로딩/에러 처리
//   if (loading) return <div className="p-4">불러오는 중...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;

//   return (
//     <div className="w-[335px] h-[698px] pt-[79px] px-[15px] bg-white">

//       {/* 최신순 ｜ 오래된순 */}
//       <div className="flex justify-end mt-[-50px] mb-[40px] gap-[10px] text-[14px]">

//         <button
//           onClick={() => setSortOrder("latest")}
//           className={`${sortOrder === "latest" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
//         >
//           최신순
//         </button>

//         <span className="text-gray-400">|</span>

//         <button
//           onClick={() => setSortOrder("old")}
//           className={`${sortOrder === "old" ? "font-bold text-[#054e76]" : "text-gray-500"} hover:underline`}
//         >
//           오래된순
//         </button>

//       </div>

//       {/* 리스트 */}
//       {sortedList.map((item) => (
//         <div key={item.id} className="flex justify-between pb-[20px]">
//           <span className="text-[16px]">{item.title}</span>
//           <span className={`text-[14px] ${statusColor[item.status]}`}>
//             {item.status}
//           </span>
//         </div>
//       ))}

//     </div>
//   );
// }

