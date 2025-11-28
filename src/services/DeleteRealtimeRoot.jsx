// src/services/DeleteRealtimeRoot.jsx
import { ref, remove } from "firebase/database";
import { rtdb } from "../firebase/config";

/**
 * 🔹 realtime 전체 삭제
 *  - 경로: realtime/
 */
export async function deleteRealtimeRoot() {
  try {
    await remove(ref(rtdb, "realtime"));
    console.log("realtime 삭제 완료");
  } catch (err) {
    console.error("realtime 삭제 실패:", err);
    throw err;
  }
}

/**
 * 🔹 에너지 관련 전체 데이터 삭제
 *  - realtime
 *  - aggMinute
 *  - aggHour
 *  - aggDay
 *  - aggMonth
 */
export async function deleteAllEnergyData() {
  const paths = ["realtime", "aggMinute", "aggHour", "aggDay", "aggMonth"];

  try {
    await Promise.all(
      paths.map((path) =>
        remove(ref(rtdb, path)).catch((err) => {
          console.error(`${path} 삭제 실패:`, err);
          // 하나라도 실패하면 전체 실패로 보고 싶으면 throw
          throw err;
        })
      )
    );
    console.log("에너지 관련 전체 데이터(realtime + agg*) 삭제 완료");
  } catch (err) {
    console.error("에너지 관련 전체 데이터 삭제 중 오류:", err);
    throw err;
  }
}
