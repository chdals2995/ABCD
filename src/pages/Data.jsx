import ElecData from "../components/data/ElecData/ElecData";
import GasData from "../components/data/GasData/GasData";
import TempData from "../components/data/TempData/TempData";
import WaterData from "../components/data/WaterData/WaterData";

export default function Data(){
    return(

    <div style={{
     position:"absolute", 
     backgroundColor:"rgba(5,78,118,0.1)", 
     top:"0px", 
     left:"0px",
     right:"0px", 
     bottom:"0px"
     }}>

    <h1>이곳은 금단의 영역... 전력 데이터!!1</h1>
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
     </div>

     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative"
      }}>
      
      
     </div>
     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginLeft:"8px",
      }}>
      
       
      
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
      
     </div>
     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginTop:"3px"
      }}>
           
     </div>
     <div style={{
      backgroundColor:"#ffffff",
      width:"529px",
      height:"390px",
      position:"relative",
      marginLeft:"8px",
      marginTop:"3px"
      }}>
        
     </div>

      </div>

     </div>
    </div>
);
} 