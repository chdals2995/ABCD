import { useState } from "react";
import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AdminUserApproval from "./pages/login/AdminUserApproval";
import AuthStatus from "./components/Login/contexts/AuthStatus";
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
            </Routes>
    </>
  );
}

export default App;
        
