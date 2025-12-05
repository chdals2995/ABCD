// src/pages/login/Login.jsx
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/logos/logo.png";
import { useState, useEffect } from "react";          // ✅ useEffect 추가
import { useAuth } from "../../components/contexts/AuthContext";

export default function Login() {
  const { login, user } = useAuth();                  // ✅ user도 같이 가져오기
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);

  // ✅ 로그인 후, user 정보(role/status)에 따라 라우팅
  useEffect(() => {
    if (!user) return; // 아직 로그인 안 했거나, 정보 로딩 전

      // 🔸 1) 아직 승인되지 않았거나, 권한이 없는 계정이면
    if (user.status !== "approved" || user.role === "none") {
      // 여기서는 *어디로도 nav 하지 않음*
      // = 로그인 페이지에 그대로 남겨두기
      // 필요하면 안내만 보여주기
      alert("관리자 승인 후에 로그인할 수 있습니다.");
      return;
    }

    // 🔸 2) 승인된 계정만 role에 따라 페이지 이동
    if (user.role === "admin") {
      nav("/admin");        // 관리자 메인
    } else if (user.role === "master") {
      nav("/main");        // 마스터(건물 총괄?) 메인
    } else if (user.role === "user") {
      nav("/userMain");    // 일반 사용자 메인
    } else {
      // 정의되지 않은 role이면 그냥 로그인 페이지에 남겨두기
      // (원하면 다른 기본 페이지로 보내도 됨)
    }
  }, [user, nav]);

 async function onSubmit(e) {
  e.preventDefault();

  const emailEmpty = !email;
  const passEmpty = !pass;

  setEmailError(emailEmpty);
  setPassError(passEmpty);

  
if (emailEmpty || passEmpty) {
    alert("빈 항목이 있습니다.")
    return;
  }

  setLoading(true);

  const errorMessage = document.querySelector("#errorMessage");
  const errorLoginBox = document.querySelector("#loginEmail");
  const errorPassBox = document.querySelector("#loginPass");
  
  try {
    // 👉 사용자가 입력한 아이디 / 이메일
    const loginId = email.trim();

    // 👉 Join.jsx와 같은 규칙: @ 있으면 그대로, 없으면 @abcd.local 붙이기
    const authEmail = loginId.includes("@")
      ? loginId
      : `${loginId}@abcd.local`;

    console.log("🔐 로그인 시도 이메일:", authEmail);

    await login(authEmail, pass);   // 여기서 authEmail 사용
  } catch (er) {
    console.error("로그인 실패:", er.code, er.message);
    errorMessage.style.color = "red";
    errorLoginBox.style.border = "3px solid red";
    errorPassBox.style.border = "3px solid red";
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
          top: "40%",
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
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            border : emailError ? "3px solid red" : "1px solid #0D5D8E",
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

        {/* 비밀번호 입력 */}
        <input
          id="loginPass"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{
            border : passError ? "3px solid red" : "1px solid #0D5D8E",
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
        <p id="errorMessage" style={{
        fontSize:"20px",
        diplay:"block",
        position:"absolute",
        left:"50%",
        transform:"translateX(-50%)",
        color : emailError ? "red" : "transparent",
        color : passError ? "red" : "transparent",
        }}>
        아이디 또는 비밀번호가 틀렸습니다.
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
            {loading ? "로그인 중..." : "로그인"}
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
