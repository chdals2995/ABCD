import "./App.css";
import {Routes, Route} from "react-router-dom";
import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import Data from "./pages/Data";
import MainPage from "./pages/MainPage";
import UserMain from "./pages/UserMain";



function App() {
  return (
    <>
            <Routes>
              <Route path="/" element={ <Login/>} />
              <Route path="/Auth" element={<AuthStatus/>} />
              <Route path="/Join" element={ <Join/>} />
              <Route path="/main" element={<MainPage/>}/>
              <Route path="/Data/*" element={<Data/>}/>
              <Route path="/UserMain" element={<UserMain/>}/>
            </Routes>
    </>
  );
}

export default App;
        
