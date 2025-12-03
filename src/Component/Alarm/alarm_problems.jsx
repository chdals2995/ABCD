import { useState, useEffect } from "react";
import cautionIcon from "../../icons/Alert_triangle.png";
import warningIcon from "../../icons/Alert_triangle_red.png";


export default function AlarmProblems() {
    
  const sections = [
    {
      title: "경고",
      iconSrc: warningIcon,
     
    },
    {
      title: "주의",
      iconSrc: cautionIcon,  
    
    },
  ];

  // 문제 카테고리
  const problems = {
    전기: ["전력 과부하", "차단기 트립", "조명 고장", "콘센트 불량"],
    온도: ["냉난방 불량", "실내온도 이상", "필터 막힘", "송풍팬/실외기 고장"],
    수도: ["누수 발생", "배수 막힘", "수압 저하", "변기 / 세면대 문제"],
    가스: ["가스 누출", "압력 이상", "밸브 오작동", "점화 불량"],
  };

  function randomDate() {
    const year = 2025;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 랜덤 리스트 생성
  function generateList() {
    const list = [];
    for (let i = 0; i < 10; i++) {
      const keys = Object.keys(problems);
      const category = keys[Math.floor(Math.random() * keys.length)];
      const itemList = problems[category];
      const problem = itemList[Math.floor(Math.random() * itemList.length)];

      list.push({
        problem,
        date: randomDate(),
      });
    }
    return list;
  }

  // ✔ impure function(Math.random) 경고 해결  
  //    → 렌더링 중에 generateList()를 실행하지 않고  
  //      최초 렌더 시 한 번만 실행하도록 useEffect 사용
  const [problemList, setProblemList] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProblemList(generateList());
  }, []);
  // 빈 배열([]) → 컴포넌트 로드 시 딱 한 번만 실행됨

  return (
    <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px] text-black">
      
      {sections.map((sec, idx) => (
        <div key={idx} className="mb-6">

          {/* 섹션 제목 + 아이콘 자리 */}
          <div className="flex items-center gap-2 mb-2">
            {/* 아이콘 자리 */}
            <img 
              src={sec.iconSrc} 
              alt={sec.title}
              className="w-[18px] h-[18px]" 
            />

            <span 
              className="text-[20px] font-regular"
              style={{ color: sec.color }}
            >
              {sec.title}
            </span>
          </div>

          {/* 리스트 */}
          <div>
            {problemList.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border-b border-[#e5e5e5] py-2"
              >
                <span
                  className="text-[16px] w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {item.problem}
                </span>

                <span className="text-[13px] text-[#555]">
                  {item.date}
                </span>
              </div>
            ))}

            {/* 리스트 끝 안내문구 */}
            <div className="w-full flex flex-col items-center py-3">
                <span className="text-[13px] text-gray-400 mb-1 ">
                    아래로 스크롤하여 주의 문제사항을 확인하세요.
                </span>
                <span className="text-[20px] text-gray-400 arrow-bounce">
                    ↓
                </span>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}


/* 
---------------------- 위에는 테스트 용 ---------------------
아래가 백엔드 (DB)를 받아와서 자동 업데이트 가능한 형태임 
*/


// import { useEffect, useState } from "react";
// import cautionIcon from "../../icons/Alert_triangle.png";
// import warningIcon from "../../icons/Alert_triangle_red.png";

// export default function AlarmProblems() {

//   const [problemList, setProblemList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // 경고/주의 UI 설정
//   const sections = [
//     { title: "경고", iconSrc: warningIcon },
//     { title: "주의", iconSrc: cautionIcon },
//   ];

//   // 📌 백엔드에서 데이터 가져오기
//   useEffect(() => {
//     async function fetchProblems() {
//       try {
//         const res = await fetch("/api/problems");   // ← 백엔드 엔드포인트
//         const data = await res.json();

//         setProblemList(data);
//       } catch (err) {
//         setError("문제 데이터를 불러오지 못했습니다.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProblems();
//   }, []);

//   if (loading) {
//     return <div className="p-4 text-gray-500">불러오는 중...</div>;
//   }

//   if (error) {
//     return <div className="p-4 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px] text-black">

//       {sections.map((sec) => (
//         <div key={sec.title} className="mb-6">

//           {/* 섹션 제목 */}
//           <div className="flex items-center gap-2 mb-2">
//             <img src={sec.iconSrc} className="w-[18px] h-[18px]" />
//             <span className="text-[20px] font-regular">{sec.title}</span>
//           </div>

//           {/* 해당 레벨의 문제만 출력 */}
//           {problemList
//             .filter((item) => item.level === sec.title)
//             .map((item, idx) => (
//               <div
//                 key={idx}
//                 className="flex justify-between border-b border-[#e5e5e5] py-2"
//               >
//                 <span className="text-[16px] w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
//                   {item.problem}
//                 </span>

//                 <span className="text-[13px] text-[#555]">
//                   {item.date}
//                 </span>
//               </div>
//             ))
//           }

//           {/* 안내문구 */}
//           <div className="w-full flex flex-col items-center py-3">
//             <span className="text-[13px] text-gray-400 mb-1">
//               아래로 스크롤하여 더 보기
//             </span>
//             <span className="text-[20px] text-gray-400 arrow-bounce">↓</span>
//           </div>

//         </div>
//       ))}

//     </div>
//   );
// }
