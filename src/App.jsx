import "./App.css";

import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import ParkingStatus from "./pages/ParkingStatus";
import Log from "./Log/Log";






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

            {/* 로그 페이지 */}
            <Route path="/log" element={<Log />} />

            <Route path="/parking/:lotId" element={<ParkingStatus />} />
            <Route path="/log" element={<Log />} />

          </Routes>
      </AuthProvider>
    </>

  );
}

export default App;
