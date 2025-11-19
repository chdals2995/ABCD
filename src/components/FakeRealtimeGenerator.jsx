// src/components/FakeRealtimeGenerator.jsx
import { useEffect } from "react";
import { saveRoomRealtimeData } from "../services/saveRoomRealtimeData";

export default function FakeRealtimeGenerator() {
  useEffect(() => {
    const floor = "1F";
    const room = "101"; // 일단 101호 하나만 테스트

    const timer = setInterval(() => {
      // 1초마다 임의 데이터 생성
      const elec = Number((Math.random() * 5 + 1).toFixed(2)); // 1 ~ 6 kWh
      const water = Number((Math.random() * 3 + 0.5).toFixed(2)); // 0.5 ~ 3.5
      const gas = Number((Math.random() * 2 + 0.2).toFixed(2)); // 0.2 ~ 2.2
      const temp = Number((Math.random() * 4 + 22).toFixed(1)); // 22.0 ~ 26.0 ℃

      saveRoomRealtimeData({
        floor,
        room,
        elec,
        water,
        gas,
        temp,
      }).catch((err) => {
        console.error("실시간 더미 데이터 저장 실패:", err);
      });
    }, 1000); // 1초 간격

    // 컴포넌트 사라질 때 인터벌 정리
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ padding: "8px", fontSize: "14px" }}>
      <strong>실시간 더미 데이터 생성 중</strong>
      <p>1초마다 1F 101호 전기/가스/수도/온도 데이터가 RTDB에 저장됩니다.</p>
    </div>
  );
}
