// src/Component/Alarm/AlarmProblems.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../firebase/config";

import cautionIcon from "../../icons/Alert_triangle.png";
import warningIcon from "../../icons/Alert_triangle_red.png";

export default function AlarmProblems() {
  const [items, setItems] = useState([]);

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

  const warningList = items.filter((x) => x.status === "접수");
  const cautionList = items.filter((x) => x.status === "처리중");

  const sections = [
    { title: "경고", icon: warningIcon, data: warningList },
    { title: "주의", icon: cautionIcon, data: cautionList },
  ];

  return (
    <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px]">

      {sections.map((sec) => (
        <div key={sec.title} className="mb-6">

          {/* 섹션 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <img src={sec.icon} className="w-[18px] h-[18px]" />
            <span className="text-[20px] font-semibold">{sec.title}</span>
          </div>

          {/* 리스트 */}
          {sec.data.length === 0 && (
            <div className="text-gray-400 text-[14px] py-2">항목 없음</div>
          )}

          {sec.data.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-[#e5e5e5] py-2"
            >
              <span className="text-[16px] w-[200px] truncate">
                {item.title || item.content}
              </span>

              <span className="text-[13px] text-[#555]">
                {item.floor}층 {item.room}호
              </span>
            </div>
          ))}
        </div>
      ))}

    </div>
  );
}
