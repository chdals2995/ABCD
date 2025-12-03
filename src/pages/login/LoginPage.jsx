import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logos/logo.png"
import { useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext";



export default function LoginPage() {
const {login} = useAuth();
const nav = useNavigate();

const[loading, setLoading] = useState(false);
const[id, setId] = useState("");
const[pass, setPass] = useState("");

const[idError, setIdError] = useState(false);
const[passError, setPassError] = useState(false);

async function onSubmit(e){
  e.preventDefault();

  setIdError(!id);
  setPassError(!pass);

  if(!id || !pass){
    return;
  }

  setLoading(true);

try{
await login(id, pass)
  nav("/");
}catch(er){
  console.error(er);
}finally{
  setLoading(false);
}

}





  return (
    <form onSubmit={onSubmit}>
    <div
      style={{
        width: "761px",
        height: "793px",   // ✔ 오타 수정
        position: "relative",
        left: "50%",
        marginTop: "100px",
        transform: "translateX(-50%)",
      }}
    >
      
      <div style={{
      position:"relative"
     }}>
      
    {/* 로그인 페이지 로고 */}
      <img 
      style={{
      width:"553px", 
      height:"214px",
      marginLeft:"50%",
      transform:"translateX(-50%)"
      }} 
      src={Logo} alt="logo"/>
    {/* 아이디 비밀번호 입력 */}      
      
      <input id="logId"
      htmlFor="id"
      type="id"
      value={id}
      onChange={(e) => setId(e.target.value)}
      style={{
      border: idError ? "1px solid red" : "1px solid #0D5D8E",
      width:"504px",
      lineHeight:"100px",
      borderRadius:"20px",
      textIndent:"50px",
      marginTop:"34px",
      fontSize:"30px",
      fontWeight:"regular",
      marginLeft:"50%",
      transform:"translateX(-50%)"
      }} 
      placeholder="아이디"/>

      <p style={{
        fontSize:"20px",
        color:"red",
         display: idError ?"block" : "none",
      }}>아이디를 틀렸습니다.</p>

      <input
      htmlFor="password"
      type="password"
      id="logPass" 
      value={pass}
      onChange={(e) => setPass(e.target.value)}
      style={{
      border:passError ? "1px solid red" : "1px solid #0D5D8E",
      width:"504px",
      lineHeight:"100px",
      borderRadius:"20px",
      textIndent:"50px",
      marginTop:"34px",
      fontSize:"30px",
      fontWeight:"regular",
      marginLeft:"50%",
      transform:"translateX(-50%)"
      }}
      placeholder="비밀번호"/>    
     </div>

     <p style={{
        fontSize:"20px",
        color:"red",
         display: passError ?"block" : "none",
      }}>아이디를 틀렸습니다.</p>

      <div
        style={{
          position: "absolute",   // ✔ 오타 수정
          marginLeft: "50%",
          marginTop: "47px",
          transform:"translateX(-50%)"
        }}
      >
        <button
        type="submit"
        disabled={loading}
        style={{
        fontSize: "36px",
        color: "#0D5D8E",
        textAlign: "center",
        lineHeight: "95px",
        cursor: "pointer",
        width: "407px",
        border: "2px solid #013D5E",
        borderRadius: "20px",
        }}>
        로그인
        </button>
    
        <div>
          <div
            style={{
              marginLeft: "50%",
              marginTop: "10px",
              transform: "translateX(-50%)",
              display: "flex",
              justifyContent: "center",
            }}
          >
             <Link
              style={{
                fontSize: "30px",
                color: "#000000",
              }}
              to="/join"
            >
              회원가입신청
            </Link>
  
          </div>
        </div>
      </div>
    </div>
    </form>
  );
}
