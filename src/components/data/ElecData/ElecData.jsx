import { Link } from "react-router-dom";
import ElecError from "./ElecError";
import Tdata from "./Tdata";
import Pdata from "./Pdata";
import Sdata from "./Sdata";
import MaxData from "./MaxData";
import EmData from "./EmData";

export default function ElecData(){
     return(

    <div style={{
     position:"absolute", 
     backgroundColor:"rgba(5,78,118,0.1)", 
     top:"0px", 
     left:"0px",
     right:"0px", 
     bottom:"0px"
     }}>

    <nav>
     <Link style={{marginLeft:"20px"}} to="/Data/WaterData">온도</Link>
     <Link style={{marginLeft:"20px"}} to="/Data/TempData">수도</Link>
     <Link style={{marginLeft:"20px"}} to="/Data/GasData">가스</Link>
    </nav>

    <div style={{
      width:"1619px",   
      height:"810px ", 
      position:"absolute", 
      top:"50%", left:"50%", 
      transform:"translate(-50%, -50%)",
      backgroundColor:"transparent"
      }}>

     <div style={{
      display:"flex",
      justifyContent:"center",
      aliginItems:"center",
      width:"1619px", 
      height:"50%", 
      backgroundColor:"transparent",
      position:"absolute",
      top:"5px",
      padding:"5px"
      }}>

     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginRight:"8px",
      }}>
      <ElecError></ElecError>
     </div>

     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative"
      }}>
      <Sdata></Sdata>
     </div>

     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginLeft:"8px",
      }}>
      <Tdata></Tdata>
     </div>

      </div>
     <div style={{
      display:"flex",
      justifyContent:"center",
      aliginItems:"center",
      width:"1619px", 
      height:"50%", 
      backgroundColor:"transparent",
      position:"absolute",
      padding:"5px",
      bottom:"5px"
      }}>

     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginRight:"8px",
      marginTop:"3px"
      }}>
      <Pdata></Pdata>
     </div>
     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginTop:"3px"
      }}>
      <EmData></EmData> 
     </div>
     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginLeft:"8px",
      marginTop:"3px"
      }}>
      <MaxData></MaxData>
     </div>

      </div>

     </div>
    </div>
);
}