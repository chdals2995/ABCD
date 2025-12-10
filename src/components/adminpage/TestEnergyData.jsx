// src/components/adminpage/TestEnergyData.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, query, orderByKey, limitToLast, get } from "firebase/database";
import TestEnergyRealtimeChart from "./TestEnergyRealtimeChart";

export default function TestEnergyData() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    dateKey: null,
    minuteKey: null,
    data: null,
  });

  useEffect(() => {
    async function load() {
      try {
        // 1️⃣ aggMinuteBuilding 루트에서 가장 최근 dateKey 가져오기
        const dateRef = ref(rtdb, "aggMinuteBuilding");
        const dateSnap = await get(
          query(dateRef, orderByKey(), limitToLast(1))
        );

        if (!dateSnap.exists()) {
          setState({
            loading: false,
            error: "aggMinuteBuilding에 데이터가 없습니다.",
            dateKey: null,
            minuteKey: null,
            data: null,
          });
          return;
        }

        const [dateKey, minutesObj] = Object.entries(dateSnap.val())[0];

        if (!minutesObj || Object.keys(minutesObj).length === 0) {
          setState({
            loading: false,
            error: `${dateKey} 에 분 단위 데이터가 없습니다.`,
            dateKey,
            minuteKey: null,
            data: null,
          });
          return;
        }

        // 2️⃣ 그 날짜 안에서 가장 마지막 minuteKey (예: "21:14") 찾기
        const minuteEntries = Object.entries(minutesObj).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        const [minuteKey, latestData] = minuteEntries[minuteEntries.length - 1];

        setState({
          loading: false,
          error: null,
          dateKey,
          minuteKey,
          data: latestData,
        });
      } catch (err) {
        console.error("TestEnergyData load error:", err);
        setState({
          loading: false,
          error: String(err),
          dateKey: null,
          minuteKey: null,
          data: null,
        });
      }
    }

    load();
  }, []);

  const { loading, error, dateKey, minuteKey, data } = state;

  return (
    <div className="p-4 border border-gray-300 rounded-md text-sm bg-white">
      <h2 className="font-semibold mb-2">
        TestEnergyData (aggMinuteBuilding 최신 1건)
      </h2>

      {loading && <p className="text-gray-500">불러오는 중...</p>}

      {!loading && error && (
        <p className="text-red-500 whitespace-pre-line">에러: {error}</p>
      )}

      {!loading && !error && data && (
        <div className="space-y-1">
          <p>
            <strong>dateKey:</strong> {dateKey}
          </p>
          <p>
            <strong>minuteKey:</strong> {minuteKey}
          </p>
          <p>
            <strong>elecAvg:</strong> {data.elecAvg ?? "-"}
          </p>
          <p>
            <strong>waterAvg:</strong> {data.waterAvg ?? "-"}
          </p>
          <p>
            <strong>gasAvg:</strong> {data.gasAvg ?? "-"}
          </p>

          <p className="mt-2">
            <strong>raw JSON:</strong>
          </p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {!loading && !error && !data && (
        <p className="text-gray-500">데이터가 없습니다.</p>
      )}
      <TestEnergyRealtimeChart />
    </div>
  );
}
