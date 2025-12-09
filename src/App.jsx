import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import Data from "./pages/Data";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import UserMain from "./pages/UserMain";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/UserMain" element={<UserMain/>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
