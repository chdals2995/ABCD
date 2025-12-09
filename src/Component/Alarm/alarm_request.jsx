// src/Component/Alarm/AlarmRequest.jsx

import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";

export default function AlarmRequest() {
  
  const [items, setItems] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");

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
        type: v.type || "",
        createdAt: Number(v.createdAt) || 0,
      }));

      setItems(list);
    });
  }, []);

  const sorted = [...items].sort((a, b) =>
    sortOrder === "latest"
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt
  );

  return (
    <div className="w-[335px] h-[698px] pt-[20px] px-[15px] bg-white">

      {/* 정렬 */}
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

      {/* 리스트 */}
      {sorted.map((item) => (
        <div key={item.id} className="flex justify-between items-center pb-[15px] border-b border-gray-300">

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0004]"></span>

            <span className="text-[16px] font-medium">
              {item.title || item.content}
            </span>
          </div>

          <span
            className={`text-[14px] font-semibold
              ${item.status === "접수" ? "text-green-600" : ""}
              ${item.status === "처리중" ? "text-orange-500" : ""}
              ${item.status === "완료" ? "text-blue-600" : ""}
            `}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}
