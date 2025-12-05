// src/pages/login/AdminUserApproval.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue, update } from "firebase/database";
import { useAuth } from "../../components/contexts/AuthContext";
import AuthStatus from "../../components/contexts/AuthStatus";



const ROLE_OPTIONS = [
  { value: "user",   label: "일반 사용자" },
  { value: "admin", label: "건물 관리자" },
  { value: "master",  label: "사이트 관리자" },
];

export default function AdminUserApproval() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(rtdb, "users");

    const unsub = onValue(
      usersRef,
      (snap) => {
        const val = snap.val();

        console.log("📌 RTDB /users 전체 데이터:", val);

        if (!val) {
          setUsers([]);
          return;
        }

        const list = Object.entries(val).map(([id, data]) => ({
          id,
          ...data,
        }));
        console.log("📌 변환된 리스트:", list);

        // 🔥 디버깅 단계: 일단 전체 유저를 다 보여주자
        setUsers(list);

        // 👉 나중에 다시 pending만 보고 싶으면 이걸로 교체
        // const pendingList = list.filter((u) => u.status === "pending");
        // console.log("📌 pending만 필터링:", pendingList);
        // setUsers(pendingList);
      },
      (err) => {
        console.error("❌ onValue 에러:", err);
      }
    );

    return () => unsub();
  }, []);

  const handleApprove = async (u, role) => {
    try {
      const userRef = ref(rtdb, `users/${u.id}`);
      await update(userRef, {
        status: "approved",
        role: role || "user",
        approvedAt: Date.now(),
        approvedBy: currentUser?.uid || null,
      });
    } catch (e) {
      console.error("승인 중 오류:", e);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  // const handleReject = async (u) => {
  //   try {
  //     const userRef = ref(rtdb, `users/${u.id}`);
  //     await update(userRef, {
  //       status: "rejected",
  //       approvedAt: Date.now(),
  //       approvedBy: currentUser?.uid || null,
  //     });
  //   } catch (e) {
  //     console.error("거절 중 오류:", e);
  //     alert("거절 처리 중 오류가 발생했습니다.");
  //   }
  // };

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, _selectedRole: newRole } : u
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">가입 신청 승인</h1>
      <AuthStatus/>
      {users.length === 0 && (
        <p className="text-sm text-gray-500">
          (디버깅용) 현재 RTDB에서 가져온 회원이 없습니다.
        </p>
      )}

      {users.length > 0 && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">UID</th>
              <th className="border px-2 py-1">이메일</th>
              <th className="border px-2 py-1">이름</th>
              <th className="border px-2 py-1">전화번호</th>
              <th className="border px-2 py-1">상태(status)</th>
              <th className="border px-2 py-1">권한(role)</th>
              <th className="border px-2 py-1">액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.id}</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.name}</td>
                <td className="border px-2 py-1">{u.phone}</td>
                <td className="border px-2 py-1">{String(u.status)}</td>
                <td className="border px-2 py-1">
                  <select
                    value={u._selectedRole || u.role || "user"}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border rounded px-1 py-0.5"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1 space-x-1">
                  <button
                    className="px-2 py-1 text-xs rounded bg-green-600 text-white"
                    onClick={() =>
                      handleApprove(u, u._selectedRole || u.role || "user")
                    }
                  >
                    승인
                  </button>
                  {/* <button
                    className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                    onClick={() => handleReject(u)}
                  >
                    거절
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      
    </div>
  );
}
