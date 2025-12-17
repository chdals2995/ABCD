import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { rtdb } from "../firebase/config"; // 경로는 프로젝트에 맞게 조정

export default function UserLayout() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const auth = getAuth();

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
    <div className="TopMenu w-[372px] h-[68px] px-[74px] bg-[#0888D4] 
                absolute top-0 right-0 flex items-center justify-betwee text-white size-[10px]"> 안녕하세요! “{userId}”님 </div>
  );
}
