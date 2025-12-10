import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import Data from "./pages/Data";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
<<<<<<< HEAD
import UserMain from "./pages/UserMain";
=======
import Master from "./pages/Master"
>>>>>>> 380f18a53ece296211dbafbf3a49faf7cbb4debf

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
<<<<<<< HEAD
            <Route path="/UserMain" element={<UserMain/>} />
=======
            <Route path="/Master" element={<Master />} />

>>>>>>> 380f18a53ece296211dbafbf3a49faf7cbb4debf
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
