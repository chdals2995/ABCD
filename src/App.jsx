import { useState } from "react";
import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AdminUserApproval from "./pages/login/AdminUserApproval";
import Main from "./pages/Main";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import Data from "./pages/Data";
import ElecData from "./components/data/ElecData/ElecData";
import TempData from "./components/data/TempData/TempData";
import WaterData from "./components/data/WaterData/WaterData";
import GasData from "./components/data/GasData/GasData";


function App() {
  return (
    <>
      <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/UserMain" element={<AuthStatus/>} />
              <Route path="/Join" element={ <Join/>} />
              <Route path="/admin" element={<AdminUserApproval/>}/>
              <Route path="/main" element={<Main/>}/>
              <Route path="/Data" element={<Data/>}/>
            </Routes>
    </>
  );
}

export default App;
        
