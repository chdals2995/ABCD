import Login from "../components/login/Login";
import LoginPage from "../pages/login/LoginPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

export default function App(){
  return(
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
      </Routes>
    </Router>
  )
}