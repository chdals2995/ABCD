import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import Data from "./pages/Data";
import MainPage from "./pages/MainPage";



function App() {
  return (
    <>
      <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/UserMain" element={<AuthStatus/>} />
              <Route path="/Join" element={ <Join/>} />
              <Route path="/main" element={<MainPage/>}/>
              <Route path="/Data/*" element={<Data/>}/>
            </Routes>
    </>
  );
}

export default App;
        
