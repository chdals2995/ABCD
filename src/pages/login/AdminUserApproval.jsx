// src/pages/AdminUserApproval.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../firebase/config";
import { ref, onValue, update } from "firebase/database";

const ROLE_OPTIONS = [
  { value: "user", label: "일반 사용자" },
  { value: "manager", label: "관리자(건물/설비)" },
  { value: "admin", label: "사이트 관리자" },
];

export default function AdminUserApproval() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(rtdb, "users");

    const unsub = onValue(usersRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, data]) => ({
        id,
        ...data,
      }));
      setUsers(list.filter((u) => u.status === "pending"));
    });

    return () => unsub();
  }, []);

  const handleApprove = async (user, role) => {
    try {
      const userRef = ref(rtdb, `users/${user.id}`);
      await update(userRef, {
        status: "approved",
        role: role || "user",
        approvedAt: Date.now(),
      });
    } catch (e) {
      console.error("승인 중 오류:", e);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (user) => {
    try {
      const userRef = ref(rtdb, `users/${user.id}`);
      await update(userRef, {
        status: "rejected",
      });
    } catch (e) {
      console.error("거절 중 오류:", e);
      alert("거절 처리 중 오류가 발생했습니다.");
    }
  };

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

      {users.length === 0 && (
        <p className="text-sm text-gray-500">
          승인 대기 중인 회원이 없습니다.
        </p>
      )}

      {users.length > 0 && (
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">이메일</th>
              <th className="border px-2 py-1">이름</th>
              <th className="border px-2 py-1">전화번호</th>
              <th className="border px-2 py-1">권한</th>
              <th className="border px-2 py-1">액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.name}</td>
                <td className="border px-2 py-1">{u.phone}</td>
                <td className="border px-2 py-1">
                  <select
                    value={u._selectedRole || "user"}
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
                      handleApprove(u, u._selectedRole || "user")
                    }
                  >
                    승인
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                    onClick={() => handleReject(u)}
                  >
                    거절
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
