import logo from "../../assets/logos/logo.png";

export default function Login() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <img
          style={{
            width: "553px",
            height: "214px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          src={logo}
          alt="logo"
        />

        <form>
          <input
            style={{
              border: "1px solid #0D5D8E",
              width: "504px",
              lineHeight: "100px",
              borderRadius: "20px",
              textIndent: "50px",
              marginTop: "34px",
              fontSize: "30px",
              fontWeight: "regular", 
              marginLeft: "50%",
              transform: "translateX(-50%)",
            }}
            type="text"
            placeholder="아이디"
          />

          <input
            style={{
              border: "1px solid #0D5D8E",
              width: "504px",
              lineHeight: "100px",
              borderRadius: "20px",
              textIndent: "50px",
              marginTop: "34px",
              fontSize: "30px",
              fontWeight: "normal",
              marginLeft: "50%",
              transform: "translateX(-50%)",
            }}
            type="password"
            placeholder="비밀번호"
          />
        </form>
      </div>
    </>
  );
}
