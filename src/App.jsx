import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/alarm" element={<Alarm />} />
    </Routes>
  );
}

export default App;
