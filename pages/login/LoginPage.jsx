import { Link } from "react-router-dom"
import Login from "../../components/login/Login"


export default function LoginPage(){
  return(
    <div style={{
      width:"761px",
      hegith:"793px",
      position:"relative",
      left:"50%",
      marginTop:"100px",
      transform:"translateX(-50%)"
      }}>
    {/* 로그인 입력 */}
     <Login/>
     
    <div style={{
    positon:"absolute",
    marginLeft:"0px",
    marginTop:"47px"
    }}>
      
     <div style={{
     width:"407px",
     height:"95px",
     border:"2px solid #013D5E",
     borderRadius:"20px",
     marginLeft:"50%",
     transform:"translateX(-50%)"
     }}>

       <div style={{
        marginLeft:"50%",
        transform:"translateX(-50%)"
       }}>
       
      <form>
       <button style={{
       width:"100%",
       fontSize:"36px",
       color:"#0D5D8E",
       textAlign:"center",
       lineHeight:"95px",
       cursor:"pointer",
       }} 
       to="/">로그인</button>
      </form>

       </div>
    
     </div>

     <div style={{
    
     }}>

      <div style={{
        marginLeft:"50%",
        marginTop:"10px",
        transform:"translateX(-50%)",
        display:"flex",
        justifyContent:"center"
      }}>

      <Link style={{
        fontSize:"30px",
        color:"#000000",
        }} to="/">회원가입신청</Link>
      </div>
     </div>
    </div>

   </div>
  )
}