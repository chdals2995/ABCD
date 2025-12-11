import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import Log from "./Log/Component/Log";
import AdminLayout from "./layout/AdminLayout";

import "./App.css";

import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
<<<<<<< HEAD
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

        {/* 로그 페이지 */}
        <Route path="/log" element={<Log />} />

      </Routes>
    </AuthProvider>
=======
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/UserMain" element={<AuthStatus />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/floors" element={<Floors />} />
            <Route path="/AdminPage" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
>>>>>>> a2881fa7d07b7f3d1f4371e96ab01417ef69c738
  );
}

export default App;
