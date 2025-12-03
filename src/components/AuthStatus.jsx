// components/AuthStatus.jsx
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "../pages/login/Login";

export default function AuthStatus() {
  const { user, logout } = useAuth();  // ✅ logout 이름 맞추기

  async function handleLogout() {
    await logout();
  }

  return (
    <>
      <Link to="/login">LoginPage</Link>

      {user ? (
        <div>
          <span>{user.email}님</span>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <div>
          <Login />
        </div>
      )}
    </>
  );
}
