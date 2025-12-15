// src/Component/Alarm/AlarmProblems.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../../firebase/config";

import cautionIcon from "../../icons/Alert_triangle.png";
import warningIcon from "../../icons/Alert_triangle_red.png";

export default function AlarmProblems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");

    return onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        return;
      }

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const list = [];

      Object.entries(data).forEach(([floor, dates]) => {
        Object.entries(dates).forEach(([, alerts]) => {
          Object.entries(alerts).forEach(([id, v]) => {
            const createdAt = Number(v.createdAt) || 0;

            // ✅ 1주일 이전 제외
            if (createdAt < oneWeekAgo) return;

            // ✅ 완료된 항목 제외
            if (v.level === "completed" || v.status === "done") return;

            list.push({
              id,
              floor,
              level: v.level,      // warning | caution
              metric: v.metric,
              reason: v.reason,
              value: v.value,
              createdAt,
            });
          });
        });
      });

      // 최신순
      list.sort((a, b) => b.createdAt - a.createdAt);

      // 최대 5개
      setItems(list.slice(0, 5));
    });
  }, []);

  const warningList = items.filter((x) => x.level === "warning");
  const cautionList = items.filter((x) => x.level === "caution");

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

          {/* 비어있을 때 */}
          {sec.data.length === 0 && (
            <div className="text-gray-400 text-[14px] py-2">
              항목 없음
            </div>
          )}

          {/* 리스트 */}
          {sec.data.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-[#e5e5e5] py-2 mb-6"
            >
              <span className="text-[16px] w-[200px] truncate">
                {item.metric} · {item.reason}
              </span>

              <span className="text-[13px] text-[#555]">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
