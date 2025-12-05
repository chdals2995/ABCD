import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Master from "./pages/Master";
import "./App.css";
import JoinRequest from "./components/Master/JoinRequest";
import JoinRequestList from "./components/Master/JoinRequestList";
import MainPage from "./pages/MainPage";

function App() {
  return (<>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage/>}/>
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
