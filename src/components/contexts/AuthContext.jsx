// src/components/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, rtdb } from "../../firebase/config"; // ✅ rtdb 추가
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { ref, get } from "firebase/database";       // ✅ RTDB 읽기용 추가

// Context 생성
const AuthContext = createContext(null);

// 훅
export function useAuth() {
  return useContext(AuthContext);
}

// Provider
export function AuthProvider({ children }) {
  /**
   * user 형태 (로그인 시):
   * {
   *   uid, email,
   *   name, phone,
   *   role, status,
   *   createdAt, approvedAt, approvedBy
   * }
   */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 / 로그아웃 / 새로고침 시 사용자 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // 로그아웃 상태
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // ✅ RTDB에서 프로필 정보 가져오기
        const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
        const snap = await get(userRef);
        const profile = snap.val() || {};

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profile.name || "",
          phone: profile.phone || "",
          role: profile.role || "",                // 권한 (admin / manager / viewer 등)
          status: profile.status || "pending",     // 승인 상태 (pending / approved / rejected)
          createdAt: profile.createdAt || null,
          approvedAt: profile.approvedAt || null,
          approvedBy: profile.approvedBy || null,
        });
      } catch (error) {
        console.error("❌ [AuthContext] 사용자 정보 로딩 오류:", error);
        // RTDB 읽기 실패해도 최소한 Auth 정보는 유지
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: "",
          status: "pending",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // 회원가입
  async function signup(email, password) {
    try {
      // ✅ 여기서는 "Auth 계정만" 만드는 용도로 둘 수 있어
      // Join.jsx에서 이미 RTDB users/{uid}에 profile+status 저장하고 있으니까
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (error) {
      console.error("❌ [AuthContext] 회원가입 오류:", error.code, error.message);
      throw error;
    }
  }

  // 로그인
  async function login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (error) {
      console.error("❌ [AuthContext] 로그인 오류:", error.code, error.message);
      throw error;
    }
  }

  // 로그아웃
  async function logout() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("❌ [AuthContext] 로그아웃 오류:", error.code, error.message);
      throw error;
    }
  }

  const value = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          인증 상태 확인중…
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
