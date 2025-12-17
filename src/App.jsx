import "./App.css";
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  useLocation,
} from "react-router-dom";

import Join from "./pages/login/Join";
import Login from "./pages/login/Login";
import AuthStatus from "./components/Login/contexts/AuthStatus";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";

import Data from "./pages/Data"
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import Master from "./pages/Master";
import ParkingStatus from "./pages/ParkingStatus";
import UserMain from "./pages/UserMain"
// import Data from "./pages/Data";
import Problems from "./problems/problems"

import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb, auth } from "./firebase/config";

import Alarm from "./alarm/Alarm";

// ✅ role별 "기본 홈" (권한 없을 때 튕길 목적지)
function homeByRole(role) {
  if (role === "master" || role === "admin") return "/main";
  if (role === "user") return "/UserMain";
  return "/";
}

/**
 * ✅ 역할(ROLE) 기반 라우트 가드
 * - allowRoles: 허용 role 배열 (예: ["admin","master"])
 * - 로그인 안 됨 -> "/"로
 * - 권한 없음 -> role에 맞는 홈으로(/main or /UserMain)
 */
function RequireRole({ allowRoles, children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let alive = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;

      if (!user) {
        setLoggedIn(false);
        setRole(null);
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      try {
        const snap = await get(ref(rtdb, `users/${user.uid}`));
        const r = snap.exists() ? snap.val()?.role ?? null : null;
        if (!alive) return;
        setRole(r);
      } catch (e) {
        console.error("RequireRole: role load failed:", e);
        if (!alive) return;
        setRole(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-[#054E76]">
        로딩중...
      </div>
    );
  }

  // 로그인 안 했으면 로그인 페이지로
  if (!loggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // 로그인 했는데 role이 없거나 허용 role이 아니면 -> role 홈으로
  if (!allowRoles.includes(role)) {
    return <Navigate to={homeByRole(role)} replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ✅ 공개 */}
            <Route path="/" element={<Login />} />
            <Route path="/Join" element={<Join />} />

            {/* ✅ user 전용 */}
            <Route
              path="/UserMain"
              element={
                <RequireRole allowRoles={["user"]}>
                  <UserMain/>
                </RequireRole>
              }
            />

            {/* ✅ admin/master 전용 (메인도 잠금) */}
            <Route
              path="/main"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <MainPage />
                </RequireRole>
              }
            />

            {/* ✅ master 전용 */}
            <Route
              path="/master"
              element={
                <RequireRole allowRoles={["master"]}>
                  <Master />
                </RequireRole>
              }
            />

            {/* ✅ admin/master만 접근 가능 */}
            <Route
              path="/floors"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <Floors />
                </RequireRole>
              }
            />

            {/* ✅ 경로 대소문자/메뉴 네비 꼬임 방지용: AdminPage, adminpage 둘 다 받기 */}
            <Route
              path="/AdminPage"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <AdminPage />
                </RequireRole>
              }
            />
            <Route
              path="/adminpage"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <AdminPage />
                </RequireRole>
              }
            />

            <Route
              path="/parking/:lotId"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <ParkingStatus />
                </RequireRole>
              }
            />

            
            <Route
              path="/data/*"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <Data />
                </RequireRole>
              }
            />

            <Route
              path="/alarm"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <Alarm />
                </RequireRole>
              }
            />

             <Route
              path="/problems"
              element={
                <RequireRole allowRoles={["admin", "master"]}>
                  <Problems />
                </RequireRole>
              }
            /> 
          

            {/* ✅ 없는 경로는 로그인으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}
