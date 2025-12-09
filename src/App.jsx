import { Routes, Route } from "react-router-dom";
import Alarm from "./Component/Alarm/Alarm";
import Problems from "./Problems/Problems";
import "./App.css";


function App() {
  return (
    <>
   
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/alarm" element={<Alarm />} />
      <Route path="/problems" element={<Problems />} />
    </Routes>
    
    </>
  );
 
  
}

export default App;
