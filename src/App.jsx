import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import Log from "./Log/Component/Log";
import AdminLayout from "./layout/AdminLayout";


import "./App.css";
import AdminPage from "./pages/AdminPage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/alarm" element={<Alarm />} />
      <Route path="/log" element={<Log />} />
    </Routes>
  );
}

export default App;
