// src/pages/login/Join.jsx
import { useState } from "react";
import { auth, rtdb } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function Join() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",       // 01012345678 형태
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ 휴대폰 인증 관련 state (컴포넌트 최상단에!)
  const [verificationCode, setVerificationCode] = useState(""); // 입력한 인증번호
  const [isCodeSent, setIsCodeSent] = useState(false);          // 인증번호 전송 여부
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // 인증 성공 여부

  // 공통 인풋 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ reCAPTCHA 설정
  function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved:", response);
          },
        }
      );
    }
  }

  // ✅ 인증번호 발송
  async function handleSendCode() {
    if (!form.phone || form.phone.length < 10) {
      alert("휴대폰 번호를 정확히 입력하세요. (예: 01012345678)");
      return;
    }

    // 01012345678 → +821012345678 (한국 기준)
    const phoneNumber = "+82" + form.phone.replace(/^0/, "");

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      // 나중에 인증번호 확인할 때 사용
      window.confirmationResult = confirmationResult;

      setIsCodeSent(true);
      alert("인증번호를 발송했습니다.");
    } catch (err) {
      console.error("인증번호 발송 오류:", err);
      alert("인증번호 발송에 실패했습니다. Firebase 설정을 확인해주세요.");
    }
  }

  // ✅ 인증번호 확인
  async function handleVerifyCode() {
    if (!verificationCode) {
      alert("인증번호를 입력하세요.");
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(verificationCode);
      console.log("휴대폰 인증 성공:", result.user);
      setIsPhoneVerified(true);
      alert("휴대폰 인증이 완료되었습니다.");
    } catch (err) {
      console.error("인증번호 확인 오류:", err);
      alert("인증번호가 올바르지 않습니다.");
    }
  }

  // ✅ 최종 회원가입 (이메일 + 비밀번호 + RTDB + 휴대폰 인증 여부 체크)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.email || !form.password || !form.phone) {
      alert("빈 항목이 있습니다.");
      return;
    }

    if (!isPhoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 1) Firebase Auth 계정 생성
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = cred.user.uid;

      // 2) RTDB /users/{uid} 정보 저장 (승인 대기)
      const userRef = ref(rtdb, `users/${uid}`);
      await set(userRef, {
        email: form.email,
        name: form.name,
        phone: form.phone,
        status: "pending", // 관리자 승인 대기
        role: "none",      // 아직 권한 없음
        createdAt: Date.now(),
        approvedAt: null,
        approvedBy: null,
      });

      setMessage("회원가입 완료! 현재 관리자 승인 대기 중입니다.");
      // 폼 초기화
      setForm({
        email: "",
        password: "",
        name: "",
        phone: "",
      });
      setVerificationCode("");
      setIsCodeSent(false);
      setIsPhoneVerified(false);
    } catch (error) {
      console.error(error);
      setMessage("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ✅ reCAPTCHA 컨테이너 (DOM 안에 반드시 있어야 함) */}
      <div id="recaptcha-container"></div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            position: "absolute",
            width: "763px",
            height: "865px",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "1px 2px 4px 2px rgba(0,0,0,0.25)",
            padding: "20px 90px",
          }}
        >
          <h2 style={{ fontSize: "34px", fontWeight: "bold" }}>회원가입</h2>
          <p
            style={{
              fontSize: "20px",
              display: "block",
              marginBottom: "40px",
            }}
          >
            건물 관리인 회원가입 페이지
          </p>

          {/* 이름 */}
          <label
            style={{ fontSize: "24px", marginTop: "20px", display: "block" }}
          >
            이름
          </label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            style={{
              width: "569px",
              lineHeight: "68px",
              border: "3px solid rgba(0,0,0,0.3)",
              textIndent: "40px",
              borderRadius: "10px",
              marginTop: "10px",
              fontSize: "24px",
            }}
            placeholder="이름을 입력해주세요"
            required
          />

          {/* 아이디(이메일) */}
          <label
            style={{
              fontSize: "24px",
              display: "block",
              marginTop: "20px",
            }}
          >
            아이디
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{
              width: "569px",
              lineHeight: "68px",
              border: "3px solid rgba(0,0,0,0.3)",
              textIndent: "40px",
              borderRadius: "10px",
              marginTop: "10px",
              fontSize: "24px",
            }}
            placeholder="아이디(이메일) 입력"
            required
          />

          {/* 비밀번호 */}
          <label
            style={{ fontSize: "24px", marginTop: "20px", display: "block" }}
          >
            비밀번호
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{
              width: "569px",
              lineHeight: "68px",
              border: "3px solid rgba(0,0,0,0.3)",
              textIndent: "40px",
              borderRadius: "10px",
              marginTop: "10px",
              fontSize: "24px",
            }}
            placeholder="비밀번호 입력(6자 이상)"
            required
          />

          {/* 전화번호 */}
          <label
            style={{ fontSize: "24px", marginTop: "20px", display: "block" }}
          >
            전화번호
          </label>
          <div style={{ height: "68px", display: "flex", marginTop: "10px" }}>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              style={{
                width: "439px",
                lineHeight: "68px",
                border: "3px solid rgba(0,0,0,0.3)",
                textIndent: "40px",
                borderRadius: "10px",
                fontSize: "24px",
              }}
              placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)"
              required
            />

            <button
              type="button"
              onClick={handleSendCode}
              style={{
                width: "120px",
                height: "68px",
                lineHeight: "68px",
                backgroundColor: "#0888D4",
                border: "3px solid #013D5E",
                borderRadius: "10px",
                fontSize: "18px",
                color: "white",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              {isCodeSent ? "재전송" : "인증번호 받기"}
            </button>
          </div>

          <div style={{ display: "flex", height: "68px", marginTop: "10px" }}>
            <input
              type="text"
              value={verificationCode}
              placeholder="인증번호 입력"
              onChange={(e) => setVerificationCode(e.target.value)}
              style={{
                width: "274px",
                height: "68px",
                lineHeight: "68px",
                border: "3px solid rgba(0,0,0,0.3)",
                textIndent: "40px",
                borderRadius: "10px",
                fontSize: "24px",
              }}
            />

            <button
              type="button"
              onClick={handleVerifyCode}
              style={{
                width: "90px",
                height: "68px",
                lineHeight: "68px",
                backgroundColor: isPhoneVerified ? "#22c55e" : "#0888D4",
                borderRadius: "10px",
                fontSize: "18px",
                color: "white",
                cursor: "pointer",
                marginLeft: "10px",
                border: "3px solid #013D5E",
              }}
            >
              {isPhoneVerified ? "완료" : "확인"}
            </button>
          </div>

          {/* 가입 버튼 */}
          <button
            disabled={loading}
            type="submit"
            style={{
              width: "120px",
              height: "68px",
              backgroundColor: "#054E76",
              border: "3px solid #013D5E",
              borderRadius: "10px",
              fontSize: "20px",
              color: "white",
              cursor: "pointer",
              marginLeft: "50%",
              transform: "translateX(-50%)",
              marginTop: "30px",
            }}
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </div>
      </form>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
  