export default function AlarmRequest() {

  // 리스트 데이터
  const requestList = [
    { title: "방 불이 안 켜져요", status: "접수" },
    { title: "에어컨 바람이 안 나와요", status: "처리중" },
    { title: "공동구역에 쓰레기가 쌓였어요", status: "완료" },
    { title: "엘리베이터 작동이 이상해요", status: "처리중" },
    { title: "복도에서 큰 소리가 계속 나요", status: "접수" },
    { title: "가스 냄새가 나요", status: "접수" },
    { title: "수도에서 물이 안 나와요", status: "처리중" },
    { title: "난방이 작동하지 않아요", status: "완료" },
    { title: "전기가 간헐적으로 나가요", status: "접수" },
  ];

  // 상태별 색상
  const statusColor = {
    "접수": "text-black",
    "처리중": "text-[#28B804]",
    "완료": "text-[#0888D4]"
  };

  return (
    <div className="w-[335px] h-[750px] pt-[79px] px-[15px] bg-white">

      {/* 최신순 버튼 */}
      <div className="flex justify-end mt-[-50px] mb-[50px]">
        <button className="text-[14px] text-[#054e76] hover:underline">
          최신순
        </button>
      </div>

      {/* 리스트 */}
      {requestList.map((item, idx) => (
        <div key={idx} className="flex justify-between pb-[20px]">
          <span className="text-[16px]">{item.title}</span>
          <span className={`text-[14px] ${statusColor[item.status]}`}>
            {item.status}
          </span>
        </div>
      ))}

    </div>
  );
}
