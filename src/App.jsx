import { useState } from "react";
import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AdminUserApproval from "./pages/login/AdminUserApproval";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import WaterData from "./pages/data/WaterData";
import ElecData from "./pages/data/ElecData";
import TempData from "./pages/data/TempData";
import MainPage from "./pages/MainPage";


function App() {
  return (
    <>
      <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/userMain" element={<AuthStatus/>} />
              <Route path="/join" element={ <Join/>} />
              <Route path="/admin" element={<AdminUserApproval/>}/>
              <Route path="/main" element={<MainPage/>}/>
              <Route path="/ElecData" element={<ElecData/>}/>
              <Route path="/TempData" element={<TempData/>}/>
              <Route path="/WaterData" element={<WaterData/>}/>
              
            </Routes>
    </>
  );
}

export default App;
        
