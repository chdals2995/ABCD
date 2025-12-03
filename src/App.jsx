import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import TestPage from "./Component/Alarm/TestPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/alarm" element={<Alarm />} />
      <Route path="/testpage" element={<TestPage />} />
    </Routes>
  );
}

export default App;
