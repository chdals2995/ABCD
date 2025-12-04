import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Master from "./pages/Master";
import "./App.css";

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
