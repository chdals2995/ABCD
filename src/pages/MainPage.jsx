import AuthStatus from "../components/Login/contexts/AuthStatus"
import {Link} from "react-router-dom";


export default function MainPage(){
    return(
        <>
         <h2>임시 메인페이쥐</h2>
         <AuthStatus></AuthStatus>
         <nav>
          <Link to="/ElecData" style={{marginRight:"10px"}}>전력</Link>
          <Link to="/WaterData" style={{marginRight:"10px"}}>수도</Link>
          <Link to="/TempData">온도</Link>
         </nav>
        </>
    )
}