import "./App.css";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import Master from "./pages/Master";
import ParkingStatus from "./pages/ParkingStatus";
import Logout from "./pages/Logout";



function App() {
  return (
    <>
      <AuthProvider>
        
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/UserMain" element={<AuthStatus />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/master" element={<Master/>} />
            <Route path="/floors" element={<Floors />} />
            <Route path="/AdminPage" element={<AdminPage />} />
            <Route path="/parking/:lotId" element={<ParkingStatus />} />

            {/* 알람 페이지 */}
            <Route path="/alarm" element={<Alarm />} />
          
      
          </Routes>
        
      </AuthProvider>
    </>
  );
}


export default App;
