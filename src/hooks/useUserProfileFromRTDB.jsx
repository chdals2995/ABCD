// src/hooks/useUserProfileFromRTDB.js
import { useEffect, useState } from "react";
import { auth, rtdb } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

export function useUserProfileFromRTDB() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);

        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        return;
      }

      setUser(firebaseUser);

      const userRef = ref(rtdb, `users/${firebaseUser.uid}`);

      if (unsubProfile) {
        unsubProfile();
      }

      unsubProfile = onValue(userRef, (snap) => {
        setProfile(snap.val() || null);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) {
        unsubProfile();
      }
    };
  }, []);

  return { user, profile, loading };
}
