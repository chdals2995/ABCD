import { useEffect, useState } from "react";
import userIcon from "../../icons/login_icon.png";

/*
  AlarmDropDownRequest
  - 민원인(사용자)에게서 "요청"이 들어왔을 때 상단에 2.5초 동안 표시되는 드롭다운
  - alert 객체 구조 예:
      {
        id,
        floor,     // "5층"
        level,     // "경고" / "주의" / "문제" / "정상"
        metric,    // "수도" / "전력" / "가스" / "온도"
        reason,    // 상세 내용
        createdAt
      }
  - 요청 알림은 "센서 경고"가 아니라 "사람이 보낸 요청"이므로
    아이콘은 항상 사람 아이콘(userIcon)을 사용한다.
*/
export default function AlarmDropDownRequest({ alert }) {
  const [active, setActive] = useState(false);

  // 드롭다운 등장/퇴장 애니메이션 제어
  useEffect(() => {
    // 살짝 지연 후 나타나도록 설정
    setTimeout(() => setActive(true), 10);

    // 2.5초 뒤 자동으로 위로 사라짐
    const timer = setTimeout(() => setActive(false), 2500);

    // 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2
        w-[404px] h-[117px]
        bg-white shadow-md rounded-lg
        flex items-center
        px-6
        transition-all duration-300 ease-out z-[9999]
        ${active ? "top-6" : "-top-32"}
        notify-glow
      `}
    >
      {/* 왼쪽: 사람 아이콘 + 층 정보 */}
      <div className="flex flex-col items-center justify-center w-[120px]">
        <img src={userIcon} className="w-10 h-10 mb-1" />

        <span className="text-[13px] text-gray-600 mt-1 whitespace-nowrap">
          {alert?.floor || ""}
        </span>
      </div>

      {/* 오른쪽: 제목 + 상세 내용 */}
      <div className="flex flex-col flex-1 pl-3">
        {/* 예: [경고] 전력 이상 감지 */}
        <span className="text-[20px font-bold text-[#000] truncate">
          [{alert?.level}] {alert?.metric} 이상 감지
        </span>

        {/* 상세 reason (예: 과부하 가능성이 감지되었습니다.) */}
        <span className="text-[15px] text-gray-600 mt-1">
          {alert?.reason || ""}
        </span>
      </div>
    </div>
  );
}
