import Problems from "./Problems/Problems";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Master from "./pages/Master"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/UserMain" element={<AuthStatus />} />
        <Route path="/Join" element={<Join />} />
        <Route path="/main" element={<MainPage />} />
            <Route path="/Master" element={<Master />} />
            
        <Route path="/problems" element={<Problems />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
