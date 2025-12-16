import Problems from "./problems/problems";
import { Routes, Route, BrowserRouter } from "react-router-dom";
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
    <AuthProvider>
      <BrowserRouter>
       <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/UserMain" element={<AuthStatus />} />
        <Route path="/Join" element={<Join />} />
        <Route path="/main" element={<MainPage />} />
            <Route path="/Master" element={<Master />} />
            
        <Route path="/problems" element={<Problems />} />
       </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
