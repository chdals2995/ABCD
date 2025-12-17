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
import UserMain from "./pages/UserMain";
import Floors from "./pages/Floors";
import AdminPage from "./pages/AdminPage";
import Master from "./pages/Master";
import ParkingStatus from "./pages/ParkingStatus";
import Data from "./pages/Data";


import Log from "./Log/log";

import { AuthProvider } from "./components/Login/contexts/AuthContext";

import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb, auth } from "./firebase/config";

/* role별 기본 홈 */
function homeByRole(role) {
  if (role === "master" || role === "admin") return "/main";
  if (role === "user") return "/UserMain";
  return "/";
}

/* 역할 가드 */
function RequireRole({ allowRoles, children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoggedIn(false);
        setRole(null);
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      try {
        const snap = await get(ref(rtdb, `users/${user.uid}`));
        setRole(snap.exists() ? snap.val()?.role ?? null : null);
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

          <Route
            path="/master"
            element={
              <RequireRole allowRoles={["master"]}>
                <Master />
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

          {/* <Route
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
          /> */}

          <Route
            path="/log"
            element={
              <RequireRole allowRoles={["admin", "master"]}>
                <Log />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
