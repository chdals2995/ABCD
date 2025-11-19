// src/services/saveRoomRealtimeData.js
import { rtdb } from "../firebase/config";
import { ref, push, set, serverTimestamp } from "firebase/database";

/**
 * 한 호수의 실시간 데이터를 저장
 * data: { floor, room, elec, water, gas, temp }
 */
export async function saveRoomRealtimeData(data) {
  const { floor, room, elec, water, gas, temp } = data;

  // 경로: realtimeData/1F/101
  const roomRef = ref(rtdb, `realtimeData/${floor}/${room}`);

  // 새로운 측정값 하나에 대한 key 생성
  const newRef = push(roomRef);

  // 실제 저장
  await set(newRef, {
    elec,
    water,
    gas,
    temp,
    createdAt: serverTimestamp(), // Firebase 서버 시간
  });
}
