import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import Data from "./pages/Data";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";
import Master from "./pages/Master"


function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/UserMain" element={<AuthStatus />} />
            <Route path="/Join" element={<Join />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/Master" element={<Master />} />
            <Route path="/Data/*" element={<Data/>}/>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
