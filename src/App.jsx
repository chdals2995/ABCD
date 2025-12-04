import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import TestCaution from "./Component/Alarm/TestCaution";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/alarm" element={<Alarm />} />
      <Route path="/testcaution" element={<TestCaution />} />
    </Routes>
  );
}

export default App;
