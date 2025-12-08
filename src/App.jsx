import { useState } from "react";
import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AdminUserApproval from "./pages/login/AdminUserApproval";
import Main from "./pages/Main";
import AuthStatus from "./components/Login/contexts/AuthStatus";

function App() {
  return (
    <>
      <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/userMain" element={<AuthStatus/>} />
              <Route path="/join" element={ <Join/>} />
              <Route path="/admin" element={<AdminUserApproval/>}/>
              <Route path="/main" elemetn={<Main/>}/>
            </Routes>
    </>
  );
}

export default App;
        
