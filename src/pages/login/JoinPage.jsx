export default function JoinPage(){
  return(
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
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>아이디</label><form><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px"
       }} type="text" placeholder="아이디 입력(6 ~ 20자)"/></form>
      </div>

      <div style={{marginTop:"40px"}}>
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>이름</label><form><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px"
       }} type="text" placeholder="이름을 입력해주세요"/></form>
      </div>

      <div style={{marginTop:"40px"}}>
       <label style={{fontSize:"24px", fontWeight:"regular", display:"block"}}>전화번호</label><form><input style={{
       width:"569px",
       lineHeight:"68px",
       border:"3px solid rgba(0,0,0,0.3)",
       textIndent:"40px",
       borderRadius:"10px", 
       }} type="text"  placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)"/></form>
      </div>
 
   <form>
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
    </form>
     </div>
    
    
    
      
    

    </div>
  )
}