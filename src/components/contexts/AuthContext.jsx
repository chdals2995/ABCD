// src/components/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/config";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

// Context 생성
const AuthContext = createContext(null);

// 훅
export function useAuth() {
  return useContext(AuthContext);
}

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 / 로그아웃 / 새로고침 시 사용자 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 회원가입
  async function signup(email, password) {
    try {
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

  const value = { user, login, signup, logout };

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
