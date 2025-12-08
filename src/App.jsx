import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Master from "./pages/Master";
import "./App.css";
import JoinRequest from "./components/Master/join/JoinRequest";
import JoinRequestList from "./components/Master/join/JoinRequestList";

function App() {
  return (<>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Master/>}/>
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
