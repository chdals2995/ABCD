// src/components/adminpage/MemberList.jsx

import { useEffect, useState } from "react";
import addIcon from "../../assets/icons/add.png";
import Modal from "../../assets/Modal";

// 🔹 Firebase
import { rtdb, secondaryAuth } from "../../firebase/config";
import {
  ref,
  onValue,
  set,
  update,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import CloseButton from "../../assets/CloseButton";

// 숫자만 받아서 010-1234-5678 형태로 포맷
function formatPhone(value) {
  const digits = value.replace(/\D/g, ""); // 숫자만 추출

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    // 010-1234
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  // 010-1234-5678 (최대 11자리까지)
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export default function MemberList() {
  const [adminMembers, setAdminMembers] = useState([]);
  const [normalMembers, setNormalMembers] = useState([]);

  // 등록 모달
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    userId: "",
    password: "",
  });

  // 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    uid: "",
    name: "",
    phone: "",
    userId: "",
    role: "none",
  });

  // 🔐 (자동 로그인 로직 제거됨)

  // ✅ users 경로에서 실시간으로 읽어오기
  useEffect(() => {
    const usersRef = ref(rtdb, "users");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const value = snapshot.val() || {};

        const all = Object.entries(value).map(([uid, u]) => {
          const rawRole = u.role || "none";

          const isManager = rawRole === "admin" || rawRole === "master";

          const roleLabel =
            rawRole === "admin" || rawRole === "master"
              ? "관리자"
              : rawRole === "user"
              ? "사용자"
              : "없음";

          return {
            uid,
            id: uid,
            name: u.name,
            username: u.userId || u.email || "",
            userId: u.userId || "",
            phone: u.phone || "",
            email: u.email || "",
            rawRole,
            roleLabel,
            isManager,
          };
        });

        setAdminMembers(all.filter((u) => u.isManager)); // admin + master
        setNormalMembers(all.filter((u) => !u.isManager)); // 나머지
      },
      (error) => {
        console.error("users 읽기 에러:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // ================== 등록 모달 ==================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    if (name === "phone") {
      nextValue = formatPhone(value); // 전화번호 자동 하이픈
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { name, phone, userId, password } = form;

      if (!name || !userId || !password) {
        alert("이름 / ID / 비밀번호는 필수입니다.");
        return;
      }

      const email = `${userId}@abcd.local`;

      // 🔎 RTDB에서 전화번호 / ID 중복 체크
      const usersRef = ref(rtdb, "users");

      // 전화번호 중복 (전화번호를 입력한 경우에만 체크)
      if (phone) {
        const phoneQuery = query(
          usersRef,
          orderByChild("phone"),
          equalTo(phone)
        );
        const phoneSnap = await get(phoneQuery);
        if (phoneSnap.exists()) {
          alert("이미 등록된 전화번호입니다.");
          return;
        }
      }

      // ID 중복
      const idQuery = query(usersRef, orderByChild("userId"), equalTo(userId));
      const idSnap = await get(idQuery);
      if (idSnap.exists()) {
        alert("이미 사용 중인 ID입니다.");
        return;
      }

      // secondaryAuth 사용 → 현재 로그인 유지
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      const uid = cred.user.uid;

      const userRef = ref(rtdb, `users/${uid}`);
      await set(userRef, {
        name,
        phone, // 화면에 보이는 그대로(010-1234-5678) 저장
        userId,
        email,
        role: "none", // none / user / admin / master
        status: "approved",
        createdAt: Date.now(),
      });

      alert("회원이 등록되었습니다.");

      setForm({ name: "", phone: "", userId: "", password: "" });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("회원 등록 중 오류가 발생했습니다.\n" + error.message);
    }
  };

  // ================== 수정 모달 ==================

  const openEditModal = (user) => {
    setEditForm({
      uid: user.uid,
      name: user.name || "",
      phone: user.phone || "",
      userId: user.userId || user.username || "",
      role: user.rawRole || "none",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;
    if (name === "phone") {
      nextValue = formatPhone(value); // 수정 화면에서도 자동 하이픈
    }

    setEditForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { uid, name, phone, role } = editForm;
      if (!uid) {
        alert("잘못된 사용자입니다.");
        return;
      }

      const userRef = ref(rtdb, `users/${uid}`);
      await update(userRef, {
        name,
        phone,
        role, // none / user / admin / master
      });

      alert("회원 정보가 수정되었습니다.");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("회원 정보 수정 중 오류가 발생했습니다.\n" + err.message);
    }
  };

  // ================== 렌더링 ==================

  return (
    <>
      {/* 메인 회원 목록 박스 */}
      <div className="w-[665px] h-[438px] border-[12px] border-[#054E76] rounded-[10px] flex flex-col bg-white">
        {/* 헤더 */}
        <div className="px-[22px] py-[14px] flex justify-between items-center border-b border-b-[#666666]">
          <h1 className="font-bold font-pyeojin text-[25px]">회원 목록</h1>
          <button type="button" onClick={() => setIsCreateModalOpen(true)}>
            <img src={addIcon} alt="추가" className="w-[30px] h-[30px]" />
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="w-full flex-1 flex overflow-hidden text-[14px]">
          {/* 왼쪽 : 관리자 (admin + master) */}
          <div className="w-1/2 h-full border-r border-r-[#666666] overflow-y-auto">
            {adminMembers.map((user) => (
              <div
                key={user.id}
                className="group flex items-center px-4 py-2 hover:bg-[#F3F3F3] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#0888D4] mr-2" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-[11px] text-gray-500">
                      {user.username}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold mr-2">
                  {user.roleLabel}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  className="px-2 py-1 text-[11px] bg-[#E5E5E5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  수정
                </button>
              </div>
            ))}
          </div>

          {/* 오른쪽 : 사용자 / 없음 */}
          <div className="w-1/2 h-full overflow-y-auto">
            {normalMembers.map((user) => (
              <div
                key={user.id}
                className="group flex items-center px-4 py-2 hover:bg-[#D9D9D9] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#0888D4] mr-2" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-[11px] text-gray-500">
                      {user.username}
                    </span>
                  </div>
                </div>
                <span className="text-sm mr-2">{user.roleLabel}</span>
                <button
                  type="button"
                  onClick={() => openEditModal(user)}
                  className="px-2 py-1 text-[11px] bg-[#E5E5E5] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 회원 등록 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        closeOnBackdrop={false}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full h-full flex flex-col text-[14px]"
        >
          <div className="flex itemscenter justify-between px-8 py-4 border-b border-[#054E76]">
            <div className="w-6" />
            <h2 className="flex-1 text-center text-[28px] font-pyeojin">
              회원 등록
            </h2>
            <CloseButton onClick={() => setIsCreateModalOpen(false)} />
          </div>

          <div className="flex-1 px-12 py-8 space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">이름</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="이름을 입력 하세요"
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">전화번호</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="010-1111-2222"
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">ID</label>
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="ID를 입력 해 주세요"
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">비밀번호</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력 해 주세요"
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>
          </div>

          <div className="pb-6 flex justify-center">
            <button
              type="submit"
              className="w-[150px] h-[40px] rounded-[10px] bg-[#E3E3E3] text-[16px]"
            >
              등록
            </button>
          </div>
        </form>
      </Modal>

      {/* 회원 정보 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        closeOnBackdrop={false}
      >
        <form
          onSubmit={handleEditSubmit}
          className="w-full h-full flex flex-col text-[14px]"
        >
          <div className="flex items-center justify-between px-8 py-4 border-b border-[#054E76]">
            <div className="w-6" />
            <h2 className="flex-1 text-center text-[28px] font-pyeojin">
              회원 정보 수정
            </h2>
            <CloseButton onClick={() => setIsEditModalOpen(false)} />
          </div>

          <div className="flex-1 px-12 py-8 space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">이름</label>
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">전화번호</label>
              <input
                name="phone"
                value={editForm.phone}
                onChange={handleEditChange}
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="userId" className="w-[80px] text-right">ID</label>
              <input
                id="userId"
                value={editForm.userId}
                readOnly
                className="flex-1 h-[40px] bg-[#F4F4F4] px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            {/* 비밀번호는 여기선 안 바꾸고, 그냥 가짜 표시만 해 둘 수도 있음 */}
            <div className="flex items-center gap-4">
              <label className="w-[80px] text-right">비밀번호</label>
              <input
                type="password"
                value="********"
                readOnly
                className="flex-1 h-[40px] bg-[#F4F4F4] px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="role" className="w-[80px] text-right">권한</label>
              <select
                id="role"
                value={editForm.role}
                onChange={handleEditChange}
                className="flex-1 h-[40px] bg-white px-3 shadow-[0_2px_3px_rgba(0,0,0,0.25)] outline-none"
              >
                <option value="none">없음</option>
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
                <option value="master">마스터</option>
              </select>
            </div>
          </div>

          <div className="pb-6 flex justify-center">
            <button
              type="submit"
              className="w-[150px] h-[40px] rounded-[10px] bg-[#E3E3E3] text-[16px]"
            >
              등록
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
