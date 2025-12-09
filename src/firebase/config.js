// src/firebase/config.js (또는 .jsx / .ts)

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firestore / RTDB / Auth
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FB_DATABASE_URL,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

// ✅ 기본 앱 (기존대로 사용, HMR 대비)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 각 서비스 인스턴스 export
const db = getFirestore(app); // Firestore
const rtdb = getDatabase(app); // Realtime Database
const auth = getAuth(app); // 기본 Auth (실제 로그인/권한용)

// ✅ 새 유저 생성 전용 보조 앱 (메인 auth.currentUser 안 바뀜)
const secondaryApp =
  getApps().find((a) => a.name === "Secondary") ||
  initializeApp(firebaseConfig, "Secondary");

const secondaryAuth = getAuth(secondaryApp);

// Analytics (지원되는 환경에서만)
let analytics = null;

// 로그인유지를 위해
setPersistence( auth , browserLocalPersistence).catch(console.error);


if (typeof window !== "undefined") {
  isSupported().then((ok) => {
    if (ok) {
      analytics = getAnalytics(app);
    }
  });
}

<<<<<<< HEAD
=======
// export
export { app, db, rtdb, auth, secondaryAuth, analytics };
>>>>>>> 9e9098909da46e2075f054fec34e8e00e2b7cba2
