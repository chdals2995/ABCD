import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import "./App.css";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 로그인 관련 */}
        <Route path="/" element={<Login />} />
        <Route path="/Join" element={<Join />} />
        <Route path="/UserMain" element={<AuthStatus />} />

        {/* 메인 페이지 */}
        <Route path="/main" element={<MainPage />} />

        {/* 알람 페이지 */}
        <Route path="/alarm" element={<Alarm />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
