import { Link, Routes } from "react-router-dom";
import Login from "/components/login/Login";

export default function LoginPage() {
  return (
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
      <Login />

      <div
        style={{
          position: "absolute",   // ✔ 오타 수정
          marginLeft: "50%",
          marginTop: "47px",
          transform:"translateX(-50%)"
        }}
      >
        <div
          style={{
            width: "407px",
            height: "95px",
            border: "2px solid #013D5E",
            borderRadius: "20px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              marginLeft: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <form>
              <button
                style={{
                  width: "100%",
                  fontSize: "36px",
                  color: "#0D5D8E",
                  textAlign: "center",
                  lineHeight: "95px",
                  cursor: "pointer",
                }}
              >
                로그인
              </button>
            </form>
          </div>
        </div>

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
  );
}
