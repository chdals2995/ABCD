// src/services/deleteRealtimeRoot.js
import { ref, remove } from "firebase/database";
import { rtdb } from "../firebase/config";

// realtime 전체 삭제
export async function deleteRealtimeRoot() {
  try {
    await remove(ref(rtdb, "realtime"));
    console.log("realtime 삭제 완료");
  } catch (err) {
    console.error("realtime 삭제 실패:", err);
    throw err;
  }
}
