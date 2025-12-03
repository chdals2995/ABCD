import { useState } from "react";
import { useAuth } from "../../components/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Join() {
  const { signup } = useAuth();
  const nav = useNavigate();

  // id → email로 이름만 정리 (동작에는 영향 없음)
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (!email || !pw || !name || !number) {
      alert("빈 항목이 있습니다.");
      return;
    }

    setLoading(true);

    try {
      // AuthContext.signup(email, password) 구조에 맞게 전달
      await signup(email, pw);
      alert("회원가입 완료!");
      nav("/login"); // 회원가입 후 로그인 페이지로 보내는 게 일반적 (원하면 "/"로 유지해도 됨)
    } catch (er) {
      console.error("회원가입 오류:", er.code, er.message);
      if (er.code === "auth/email-already-in-use") {
        alert("이미 존재하는 아이디(이메일)입니다.");
      } else if (er.code === "auth/weak-password") {
        alert("비밀번호는 최소 6자 이상이어야 합니다.");
      } else {
        alert("다시 입력하십쇼.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div
        style={{
          width: "763px",
          height: "865px",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          marginLeft: "50%",
          marginTop: "25%",
          transform: "translate(-50%, -50%)",
          boxShadow: "1px 2px 4px 2px rgba(0,0,0,0.25)",
          padding: "60px 90px",
        }}
      >
        <h2 style={{ fontSize: "34px", fontWeight: "bold" }}>회원가입</h2>
        <p style={{ fontSize: "20px", display: "block", marginBottom: "40px" }}>
          건물 관리인 회원가입 페이지
        </p>

        {/* 아이디(이메일) */}
        <label style={{ fontSize: "24px", display: "block" }}>아이디</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "569px",
            lineHeight: "68px",
            border: "3px solid rgba(0,0,0,0.3)",
            textIndent: "40px",
            borderRadius: "10px",
          }}
          placeholder="아이디(이메일) 입력"
        />

        {/* 이름 */}
        <label
          style={{ fontSize: "24px", marginTop: "40px", display: "block" }}
        >
          이름
        </label>
        <input
          type="text"           // ✅ type="name" → "text"로만 변경
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "569px",
            lineHeight: "68px",
            border: "3px solid rgba(0,0,0,0.3)",
            textIndent: "40px",
            borderRadius: "10px",
          }}
          placeholder="이름을 입력해주세요"
        />

        {/* 전화번호 */}
        <label
          style={{ fontSize: "24px", marginTop: "40px", display: "block" }}
        >
          전화번호
        </label>
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          style={{
            width: "569px",
            lineHeight: "68px",
            border: "3px solid rgba(0,0,0,0.3)",
            textIndent: "40px",
            borderRadius: "10px",
          }}
          placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)"
        />

        {/* 비밀번호 */}
        <label
          style={{ fontSize: "24px", marginTop: "40px", display: "block" }}
        >
          비밀번호
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{
            width: "569px",
            lineHeight: "68px",
            border: "3px solid rgba(0,0,0,0.3)",
            textIndent: "40px",
            borderRadius: "10px",
          }}
          placeholder="비밀번호 입력(6자 이상)"
        />

        {/* 버튼 */}
        <button
          disabled={loading}
          style={{
            width: "120px",
            height: "55px",
            backgroundColor: "#054E76",
            border: "3px solid #013D5E",
            borderRadius: "10px",
            fontSize: "20px",
            color: "white",
            cursor: "pointer",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            marginTop: "50px",
          }}
        >
          보내기
        </button>
      </div>
    </form>
  );
}
