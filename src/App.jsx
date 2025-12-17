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
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./components/Login/contexts/AuthContext";

import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import Master from "./pages/Master";
import ParkingStatus from "./pages/ParkingStatus";
import UserMain from "./pages/UserMain";

import Alarm from "./alarm/Alarm";

import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb, auth } from "./firebase/config";

/* =========================
   role별 기본 홈
========================= */
function homeByRole(role) {
  if (role === "master" || role === "admin") return "/main";
  if (role === "user") return "/UserMain";
  return "/";
}

/* =========================
   ROLE 가드
========================= */
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
        if (!alive) return;

        const r = snap.exists() ? snap.val()?.role ?? null : null;
        setRole(r);
      } catch (e) {
        console.error("RequireRole: role load failed:", e);
        if (!alive) return;
        setRole(null);
      }

      if (alive) {
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

  if (!loggedIn) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!allowRoles.includes(role)) {
    return <Navigate to={homeByRole(role)} replace />;
  }

  return children;
}

/* =========================
   App
========================= */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 공개 */}
          <Route path="/" element={<Login />} />
          <Route path="/Join" element={<Join />} />

          {/* user */}
          <Route
            path="/UserMain"
            element={
              <RequireRole allowRoles={["user"]}>
                <UserMain />
              </RequireRole>
            }
          />

          {/* admin / master */}
          <Route
            path="/main"
            element={
              <RequireRole allowRoles={["admin", "master"]}>
                <MainPage />
              </RequireRole>
            }
          />

          {/* 알람 */}
          <Route
            path="/alarm"
            element={
              <RequireRole allowRoles={["admin", "master"]}>
                <Alarm />
              </RequireRole>
            }
          />

          <Route
            path="/floors"
            element={
              <RequireRole allowRoles={["admin", "master"]}>
                <Floors />
              </RequireRole>
            }
          />

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

          {/* master only */}
          <Route
            path="/master"
            element={
              <RequireRole allowRoles={["master"]}>
                <Master />
              </RequireRole>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
