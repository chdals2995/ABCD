// src/App.jsx
import FakeRealtimeGenerator from "./components/FakeRealtimeGenerator";
import RealtimeEnergyDashboard from "./pages/RealtimeEnergyDashboard";

function App() {
  return (
    <>
      {/* 상단 헤더 / 라우터 등 기존 내용 */}
      <FakeRealtimeGenerator />
      <RealtimeEnergyDashboard />
      {/* 나머지 페이지들 */}
    </>
  );
}

export default App;
