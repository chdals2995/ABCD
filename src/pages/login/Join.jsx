// src/pages/login/Join.jsx
import { useState } from "react";
import { auth, rtdb } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { RecaptchaVerifier} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/logo.png";




export default function Join() {
  const nav = useNavigate(); // 추가
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
   const [agreeTerms, setAgreeTerms] = useState(false);   // 약관동의 체크
  const [showTerms, setShowTerms] = useState(true);      // ✅ 약관 화면 보이기/숨기기

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
  
  // ✅ 최종 회원가입 (이메일 + 비밀번호 + RTDB + 휴대폰 인증 여부 체크)
 const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

   if (!agreeTerms) {
    alert("이용약관에 동의해야 가입할 수 있습니다.");
    return;
  }

  if (!form.name || !form.email || !form.password) {
    alert("빈 항목이 있습니다.");
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

    // 2) RTDB 저장
    const userRef = ref(rtdb, `users/${uid}`);
    const payload = {
      userId: loginId,      // ✅ 여기 수정!
      email: authEmail,
      name: form.name,
      status: "pending",
      role: "none",
      createdAt: Date.now(),
      approvedAt: null,
      approvedBy: null,
    };
    console.log("✅ RTDB에 저장할 payload:", payload);

    await set(userRef, payload);
    console.log("✅ RTDB /users/" + uid + " 저장 완료");

    // 안내 + 이동
    setMessage("회원가입이 완료되었습니다.\n관리자 승인 후 로그인할 수 있습니다.");
    nav("/", { replace: true });

    // 폼 초기화
    setForm({
      email: "",
      password: "",
      name: ""
    });
    setVerificationCode("");
    setIsCodeSent(false);
  } catch (error) {
    console.error("❌ 회원가입 중 오류:", error);
    setMessage("회원가입 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

  const passBox = document.querySelector("#passBox");

    if(form.password.length > 6){
    passBox.style.border = "3px solid rgba(0,0,0,0.3)"
    }

    if(form.password.length < 6 && form.password.length == 1){
    passBox.style.border = "3px solid red"
    }

  return (
    <div>
       {/* ✅ 이용약관 전체 화면 (처음에만 보이고, 동의하면 사라짐) */}
    {showTerms && (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "800px",
            maxHeight: "80vh",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px 32px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>
            이용약관
          </h2>

          {/* 약관 내용 스크롤 영역 */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              padding: "16px",
              marginBottom: "16px",
              fontSize: "14px",
              lineHeight: 1.5,
              whiteSpace: "pre-line",
            }}
          >
            {/* 👉 여기 안에 진짜 약관 텍스트 넣으면 됨 */}
            건물 관리인 웹 서비스 이용약관입니다.
            {"\n\n"}
            1. 목적{"\n"}
            이 약관은 정석케미칼(전자거래 사업자)이 운영하는 정석케미칼(이하 "홈페이지"이라 한다)에서 제공하는 인터넷 관련 서비스(이하 "서비스"라 한다)를 이용함에 있어 사이버홈페이지과 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
※ 「PC통신 등을 이용하는 전자거래에 대해서도 그 성질에 반하지 않는 한 이 약관을 준용합니다」
            {"\n\n"}
            2. 회원의 의무{"\n"}
            ① "홈페이지" 이란 사업자가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 아울러 사이버홈페이지을 운영하는 사업자의 의미로도 사용합니다.

② "이용자"란 "홈페이지"에 접속하여 이 약관에 따라 "홈페이지"이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.

③ '회원'이라 함은 "홈페이지"에 개인정보를 제공하여 회원등록을 한 자로서, "홈페이지"의 정보를 지속적으로 제공받으며, "홈페이지"이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

④ 비회원'이라 함은 회원에 가입하지 않고 "홈페이지"이 제공하는 서비스를 이용하는 자를 말합니다.
          </div>

          {/* 동의 체크박스 + 버튼들 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)} // 🔁 오타 주의!
            />
            <span style={{ fontSize: "14px" }}>
              위{" "}
              <span style={{ fontWeight: "bold" }}>이용약관</span>을 모두 읽고 동의합니다.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => nav(-1)} // 뒤로가기 (로그인 페이지로)
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #9ca3af",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              type="button"
              disabled={!agreeTerms}
              onClick={() => setShowTerms(false)}   // ✅ 동의 → 약관 화면 닫고 폼 보이게
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: agreeTerms ? "#0888D4" : "#9ca3af",
                color: "white",
                cursor: agreeTerms ? "pointer" : "not-allowed",
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )}
    
      {/* ✅ reCAPTCHA 컨테이너 (DOM 안에 반드시 있어야 함) */}
      <div id="recaptcha-container"></div>
      <img src={logo} style={{
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
            width: "663px",
            height: "565px",
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "1px 2px 4px 2px rgba(0,0,0,0.25)",
            padding: "20px 90px",
          }}
        >
         <div style={{position:"absolute", top:"-100px", left:"50px"}}>
          <h2 style={{ fontSize: "34px", fontWeight: "bold"}}>회원가입</h2>
          <p
            style={{
              fontSize: "20px",
              display: "block",
              marginBottom: "40px",
            }}
          >
            건물 관리인 회원가입 페이지
          </p>
          </div>

          <div style={{position:"absolute", left:"50%", top:"45%", transform:"translate(-50%, -50%)"}}>
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
              fontSize: "24px"
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
          </div>


          {/* 가입 버튼 */}
          <button
            
            disabled={loading}
            type="submit"
            style={{
              width: "120px",
              height: "55px",
              backgroundColor: "#054E76",
              border: "3px solid #013D5E",
              borderRadius: "10px",
              fontSize: "20px",
              color: "white",
              cursor: "pointer",
              transform: "translateX(-50%)", 
              position:"absolute",
              bottom:"-80px",
              left:"50%",
              transform:"translateX(-50%)"
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
  