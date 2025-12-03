import { useState } from "react"
import { useAuth } from "../../components/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function JoinPage(){
 const {join} = useAuth();
 const nav = useNavigate();

 const [id, setId] = useState("");
 const [name, setName] = useState("");
 const [number, setNumber] = useState(0);

 const [loading, setLoading] = useState(false);

 async function onSubmit(e){
  e.preventDefault();
  if(!id || !name || !number){
    alert("빈 항목이 있습니다.")
    return;
  }

  setLoading(true);

try{
  await join(id, pass);
  nav("/join")
}catch(er){
  console.error(er);
  if(er.code === "auth/id-already-in-use"){
  }else if(er.code === "auth/invalid-id"){
  }else if(er.code === "auth/weak-number"){
}else{
  alert("형식과")
}
 }

  return(
    <form>
    <div>
     
       
      <div style={{
       width:"663px",
       height:"565px",
       backGorundColor:"#FFFFFF",
       borderRadius:"10px",
       position:"relative",
       marginLeft:"50%",
       marginTop:"25%",
       transform:"translate(-50%, -50%)",
       boxShadow: "1px 2px 4px 2px rgba(0,0,0,0.25)",
       padding:"60px 45px"
       }}>

      <div style={{position:"absolute", top:"-100px"}}>
       <h2 style={{fontSize:"34px", fontWeight:"bold", color:"#000000", display:"block"}}>회원가입</h2>
       <p style={{fontSize:"20px", fontWeight:"regular", display:"block"}}>건물 관리인 회원가입 페이지</p>
      </div>

      <div>
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>아이디</label><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px"
       }} type="text" placeholder="아이디 입력(6 ~ 20자)"/>
      </div>

      <div style={{marginTop:"40px"}}>
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>이름</label><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px"
       }} type="text" placeholder="이름을 입력해주세요"/>
      </div>

      <div style={{marginTop:"40px"}}>
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>전화번호</label><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px", 
       }} type="text"  placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)"/>
      </div>
 
   
      <button style={{
      width:"120px",
      height:"55px",
      border:"3px solid #013D5E",
      backgroundColor:"#054E76",
      borderRadius:"10px",
      fontSize:"20px",
      fontWeight:"regular",
      color:"#ffffff",
      cursor:"pointer",
      marginLeft:"50%",
      transform:"translateX(-50%)",
      marginTop:"120px"
    }}>보내기</button>
    
     </div>
    
    
    
      
    

    </div>
    </form>
  )
}