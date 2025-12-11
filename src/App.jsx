import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import ParkingStatus from "./pages/ParkingStatus";
import Data from "./pages/Data";

export default function App() {
  return (
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
            <Route path="/parking/:lotId" element={<ParkingStatus />} />
            <Route path="/data/*" element={<Data/>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

