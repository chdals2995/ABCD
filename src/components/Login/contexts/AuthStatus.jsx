// src/components/AuthStatus.jsx
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";


export default function AuthStatus() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (e) {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  }

  // 로그인 안 되어 있으면 /login으로 리다이렉트
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Link to="/">LoginPage</Link>
      <div>
        <span>{user.email}님</span>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </>
  );
}