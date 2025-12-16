import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";

export default function AlarmRequest() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체"); // 🔹 필터 상태

  useEffect(() => {
    const requestsRef = ref(rtdb, "requests");

    return onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        return;
      }

      const list = Object.entries(data).map(([id, v]) => ({
        id,
        title: v.title || "",
        content: v.content || "",
        status: v.status || "접수",
        floor: v.floor || "",
        room: v.room || "",
        createdAt: Number(v.createdAt) || 0,
      }));

      // 🔹 최신순 고정
      list.sort((a, b) => b.createdAt - a.createdAt);

      setItems(list);
    });
  }, []);

  // 🔹 상태 필터 적용
  const filtered = items.filter((item) => {
    if (statusFilter === "전체") return true;
    return item.status === statusFilter;
  });

  return (
    <div className="w-[335px] h-[698px] pt-[20px] px-[15px] bg-white">
      
      {/* 🔹 상태 필터 버튼 */}
      <div className="flex justify-end mb-[10px] gap-[8px] text-[14px]">
        {["전체", "접수", "처리중", "완료"].map((status) => {
          const isActive = statusFilter === status;

          const colorClass = (() => {
            if (!isActive) return "text-gray-500";

            switch (status) {
              case "접수":
                return "text-[#25C310] font-bold";
              case "처리중":
                return "text-[#FF3B3B] font-bold";
              case "완료":
                return "text-[#367CFF] font-bold";
              default:
                return "text-[#054e76] font-bold"; // 전체
            }
          })();

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 hover:underline ${colorClass}`}
            >
              {status}
            </button>
          );
        })}
      </div>


      {/* 알람 리스트 */}
      <div className="SCROLL_CONTAINER flex flex-col gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center py-2 pb-4 border-b border-gray-300"
          >
            {/* 왼쪽 */}
            <div className="flex items-center gap-2">
              {item.status === "접수" && <span className="blink-dot"></span>}
              <span className="text-[16px] font-medium leading-6">
                {item.title || item.content}
              </span>
            </div>

            {/* 오른쪽 상태 */}
            <span
              className={`text-[17px] font-semibold
                ${item.status === "접수" ? "text-[#25C310]" : ""}
                ${item.status === "처리중" ? "text-[#FF3B3B]" : ""}
                ${item.status === "완료" ? "text-[#367CFF]" : ""}
              `}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
