import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Master from "./pages/Master";
import "./App.css";
import JoinRequest from "./components/Master/JoinRequest";
import AssetEx from "./pages/AseetEx";

function App() {
  return (<>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<JoinRequest/>}/>
      </Routes>
    </BrowserRouter></>
  );
}

export default App;
