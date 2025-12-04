import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Button from "./assets/Button";
import Admin from "./layout/AdminLayout";
import Master from "./pages/Master";

import "./App.css";
import { BrowserRouter } from "react-router-dom";
const onClick = () => {
  alert("버튼 클릭됨");
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/Master' element={<Master/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
