import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Master from "./pages/Master";
import "./App.css";
import JoinRequest from "./components/Master/JoinRequest";
import JoinRequestList from "./components/Master/JoinRequestList";
import Login from './pages/Login';

function App() {
  return (<>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>}/>
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
