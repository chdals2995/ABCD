import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import ParkingStatus from "./pages/ParkingStatus";





function App() {
  return (

  
    <>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/UserMain" element={<AuthStatus />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/floors" element={<Floors />} />
            <Route path="/AdminPage" element={<AdminPage />} />
<<<<<<< HEAD
            {/* 알람 페이지 */}
            <Route path="/alarm" element={<Alarm />} />

            {/* 로그 페이지 */}
            <Route path="/log" element={<Log />} />
=======
            <Route path="/parking/:lotId" element={<ParkingStatus />} />
>>>>>>> e527bcbe1ae862cf337d8a6d9de90d2556b979a3
          </Routes>
      </AuthProvider>
    </>

  );
}

export default App;
