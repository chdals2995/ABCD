// src/pages/login/Join.jsx
import { useState } from "react";
import { auth, rtdb } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/logo.png"


export default function Join() {
  const nav = useNavigate(); // 추가
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""       // 01012345678 형태
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [agreeTerms, setAgreeTerms] = useState(false); // 약관동의


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

    const phoneNumb = document.querySelector("#phoneNumb");

    // 휴대폰번호 입력란이 빈칸일 시 
    // 입력란 2px solid red 적용
    if (!form.phone) { 
      phoneNumb.style.border = "2px solid red";
      return;
    }

    if (form.phone.includes("-")){
      phoneNumb.style.border = "2px solid red";
      return;
    }

    if(form.phone.length !== 11){
      phoneNumb.style.border = "2px solid red";
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
      phoneNumb.style.border = "2px solid red";
    } catch (err) {
      console.error("인증번호 발송 오류:", err);
      alert("인증번호 발송에 실패하였습니다.")
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

   if (!agreeTerms) {
    alert("이용약관에 동의해야 가입할 수 있습니다.");
    return;
  }

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
      // 👉 사용자가 적은 아이디 (이메일 형식일 수도, 아닐 수도 있음)
      const loginId = form.email.trim();

      // 👉 Auth에서 쓸 실제 이메일 값
      const authEmail = loginId.includes("@")
        ? loginId
        : `${loginId}@abcd.local`;

      // 1) Firebase Auth 계정 생성
      const cred = await createUserWithEmailAndPassword(
        auth,
        authEmail,
        form.password
      );
      const uid = cred.user.uid;
      console.log("✅ Auth 계정 생성됨 uid:", uid, authEmail);

      // 2) RTDB 저장 (원본 아이디 + 실제 이메일 둘 다 저장)
      const userRef = ref(rtdb, `users/${uid}`);
      const payload = {
        userId,             // 사용자가 입력한 아이디 (이메일 아닐 수 있음)
        email: authEmail,    // Auth에 등록된 이메일
        name: form.name,
        phone: form.phone,
        status: "pending",
        role: "none",
        createdAt: Date.now(),
        approvedAt: null,
        approvedBy: null,
      };
      console.log("✅ RTDB에 저장할 payload:", payload);

      await set(userRef, payload);
      console.log("✅ RTDB /users/" + uid + " 저장 완료");

      // 👉 안내 문구 한번 보여주고
setMessage("회원가입이 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다.");

// 👉 로그인 페이지(루트 경로)로 이동
nav("/", { replace: true });   // 뒤로가기 눌러도 다시 join 안 나오게 하고 싶으면 replace:true


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
      console.error("❌ 회원가입 중 오류:", error);
      setMessage("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const passBox = document.querySelector("#passBox");
  const phoneNumb = document.querySelector("#phoneNumb");

    if(form.password.length > 6){
    passBox.style.border = "3px solid rgba(0,0,0,0.3)"
    }

    if(form.password.length < 6 && form.password.length == 1){
    passBox.style.border = "3px solid red"
    }



    else if(form.phone.length > 11){
    phoneNumb.style.border = "3px solid red"
    }

    if(form.phone.length < 11 && form.phone.length == 1){
    phoneNumb.style.border = "3px solid rgba(0,0,0,0.3)"  
    }

  return (
    <div>
      <div style={{ // 이용약관
        width:"100%", 
        height:"100%",
        backgroundColor:"#ffffff", 
        position:"absolute", 
        top:"0px", 
        bottom:"0px", 
        left:"0px",
        zIndex:100
        }}>
      
      <input 
      type="checkbox"
      checked={agreeTerms}
      onChange={(e) => setAgreeMents(e.target.checked)}
       />

       <span>
    <a href="/terms" target="_blank" rel="noreferrer">
      이용약관
    </a>
    에 동의합니다.
  </span>

<button type="submit" disabled={!agreeTerms || loading}>
  회원가입
</button>

      </div>

      {/* ✅ reCAPTCHA 컨테이너 (DOM 안에 반드시 있어야 함) */}
      <div id="recaptcha-container"></div>
      <img src={logo} style={{
        zIndex:999,
        position:"absolute", 
        top:"0px", 
        left:"0px",
        width:"329px",
        height:"128px"
        }} alt="로고이미지" />

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

          {/* 아이디 */}
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
            id="idBox"
            name="email"
            type="text"
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
            placeholder="아이디 입력"
            required
          />

          {/* 비밀번호 */}
          <label
            style={{ fontSize: "24px", marginTop: "20px", display: "block" }}
          >
            비밀번호
          </label>
          <input
            id="passBox"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={{
              border:"3px solid rgba(0,0,0,0.3)",
              width: "569px",
              lineHeight: "68px",
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
              id="phoneNumb"
              name="phone"
              className="phone-input"
              type="number"
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
            onClick={handleSubmit}
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
  