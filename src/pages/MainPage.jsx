import AuthStatus from "../components/Login/contexts/AuthStatus"
import {Link} from "react-router-dom";


export default function MainPage(){
    return(
        <>
         <h2>임시 메인페이쥐</h2>
         <AuthStatus></AuthStatus>
         <nav>
          <Link to="/Data/ElecData" style={{marginRight:"10px"}}>전력</Link>
          <Link to="/Data/WaterData" style={{marginRight:"10px"}}>수도</Link>
          <Link to="/Data/TempData">온도</Link>
         </nav>
        </>
    )
}