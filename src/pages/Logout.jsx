// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function doLogout() {
      try {
        await signOut(auth); // 🔹 Firebase 로그아웃
      } catch (err) {
        console.error("로그아웃 실패:", err);
      } finally {
        // 🔹 로그아웃이든 실패든 일단 루트("/")로 이동
        navigate("/", { replace: true });
      }
    }

    doLogout();
  }, [navigate]);

  // 짧게 상태만 보여줘도 되고, 아예 null 리턴해도 됨
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <span>로그아웃 중...</span>
    </div>
  );
}
