// src/Component/Alarm/AlarmProblems.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase/config";

import cautionIcon from "../assets/icons/iconRed.png";
import warningIcon from "../assets/icons/alert.png";

/* =========================
   한글 매핑
========================= */
const METRIC_KO = {
  water: "수도",
  gas: "가스",
  power: "전력",
  temperature: "온도",
};

const REASON_KO = {
  sustained_caution_from_normal: "정상 범위 이탈(주의 지속)",
  sustained_warning_from_normal: "정상 범위 이탈(경고 지속)",
  spike_detected: "급격한 변화 감지",
  over_threshold: "임계치 초과",
};

/* 상대 시간 계산 */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (day <= 0) return "오늘";
  if (day === 1) return "어제";
  return `${day}일 전`;
}

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

            // 최근 7일만
            if (createdAt < oneWeekAgo) return;

            // 완료 항목 제외
            if (v.level === "completed" || v.status === "done") return;

            list.push({
              id,
              floor,
              level: v.level, // warning | caution
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

  // 경고 / 주의 분리
  const warningList = items.filter((x) => x.level === "warning");
  const cautionList = items.filter((x) => x.level === "caution");

  // 상단 요약 문구 (층별 최신 1건)
  const summaryText = Object.values(
    items.reduce((acc, cur) => {
      if (!acc[cur.floor] || acc[cur.floor].createdAt < cur.createdAt) {
        acc[cur.floor] = cur;
      }
      return acc;
    }, {})
  )
    .map((item) => `${item.floor} / ${timeAgo(item.createdAt)}`)
    .join(" · ");

  const sections = [
    { title: "경고", icon: warningIcon, data: warningList },
    { title: "주의", icon: cautionIcon, data: cautionList },
  ];

  return (
    <div className="w-[335px] min-h-[698px] bg-white px-[15px] py-[10px]">
      {/* 상단 요약 */}
      <div className="text-[12px] text-gray-400 mb-5 truncate mt-3">
        {summaryText || "최근 7일 이내 발생한 점검 알림"}
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="mb-6">
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-2 mb-4">
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
              className="flex justify-between border-b border-[#e5e5e5] py-2 mb-4"
            >
              <span className="text-[16px] w-[180px] truncate">
                {METRIC_KO[item.metric] || item.metric}
                {" · "}
                {REASON_KO[item.reason] || item.reason}
              </span>

              <span className="text-[13px] text-[#555] whitespace-nowrap">
                {item.floor} /{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
