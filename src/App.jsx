import { useState } from "react";
import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";


function App() {
  return (
    <>
      <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/UserMain" element={<AuthStatus/>} />
              <Route path="/Join" element={ <Join/>} />
              <Route path="/main" element={<MainPage/>}/>
            </Routes>
    </>
  );
}

export default App;
        
