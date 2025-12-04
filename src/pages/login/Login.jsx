import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logos/logo.png";
import { useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  // id → email로 이름만 바꿔줄게 (동작에는 영향 X, 가독성만 좋아짐)
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    console.log("📌 [Login] 로그인 버튼 클릭됨");
    console.log("입력된 이메일:", email);
    console.log("입력된 PW:", pass);

    setEmailError(!email);
    setPassError(!pass);

    if (!email || !pass) {
      console.log("❌ [Login] 이메일 또는 비밀번호 미입력");
      return;
    }

    setLoading(true);

    try {
      console.log("⏳ [Login] login() 실행 시작");
      const result = await login(email, pass); // ✅ AuthContext.login(email, pw)
      console.log("✅ [Login] 로그인 성공:", result);

      nav("/userMain"); // 로그인 성공 후 메인으로 이동
    } catch (er) {
      console.error("❌ [Login] 로그인 실패:", er.code, er.message);
      alert("아이디 또는 비밀번호가 잘못되었습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div
        style={{
          width: "761px",
          height: "793px",
          position: "absolute",
          left: "50%",
          top:"40%",
          marginTop: "100px",
          transform: "translate(-50%, -50%)",
          border: "5px solid #0888D4",
          padding: "40px",
          borderRadius: "20px",
        }}
      >
        {/* 로고 */}
        <img
          style={{
            width: "553px",
            height: "214px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          src={Logo}
          alt="logo"
        />

        {/* 이메일 입력 */}
        <input
          id="loginEmail"
          type="email" // ✔ 이메일 입력
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            border: emailError ? "1px solid red" : "1px solid #0D5D8E",
            width: "504px",
            lineHeight: "100px",
            borderRadius: "20px",
            textIndent: "50px",
            marginTop: "34px",
            fontSize: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          placeholder="이메일"
        />
        <p
          style={{
            position: "absolute",
            display: emailError ? "block" : "none",
            color: "red",
            fontSize: "20px",
            left: "150px",
          }}
        >
          이메일을 입력해주세요.
        </p>

        {/* 비밀번호 입력 */}
        <input
          id="loginPass"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            border: passError ? "1px solid red" : "1px solid #0D5D8E",
            width: "504px",
            lineHeight: "100px",
            borderRadius: "20px",
            textIndent: "50px",
            marginTop: "34px",
            fontSize: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
          }}
          placeholder="비밀번호"
        />
        <p
          style={{
            position: "absolute",
            display: passError ? "block" : "none",
            color: "red",
            fontSize: "20px",
            left: "150px",
          }}
        >
          비밀번호를 입력해주세요.
        </p>

        {/* 로그인 버튼 & 회원가입 링크 */}
        <div
          style={{
            marginLeft: "50%",
            marginTop: "47px",
            transform: "translateX(-50%)",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              fontSize: "36px",
              color: "#0D5D8E",
              lineHeight: "95px",
              cursor: "pointer",
              width: "407px",
              border: "2px solid #013D5E",
              borderRadius: "20px",
              marginLeft: "50%",
              transform: "translateX(-50%)",
            }}
          >
            로그인
          </button>

          <div
            style={{
              marginTop: "10px",
              marginLeft: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Link
              style={{
                fontSize: "30px",
                color: "#000000",
                textDecoration: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              to="/join"
            >
              회원가입 신청
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
