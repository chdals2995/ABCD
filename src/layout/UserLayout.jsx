import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb, auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";

export default function UserLayout() {
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("로그아웃 실패:", err);
    } finally {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId("");
        return;
      }

      try {
        const userRef = ref(rtdb, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserId(data?.userId || data?.name || user.email || "사용자");
        } else {
          setUserId(user.email || "사용자");
        }
      } catch (e) {
        console.error("[UserLayout] user load error:", e);
        setUserId(user.email || "사용자");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      className="TopMenu w-[372px] h-[68px] px-[24px] bg-[#0888D4]
                 absolute top-0 right-0 flex items-center justify-between
                 text-white text-[14px] z-50"
    >
      <span>안녕하세요! “{userId}”님</span>

      <button
        onClick={handleLogout}
        className="cursor-pointer hover:underline"
      >
        로그아웃
      </button>
    </div>
  );
}
