//  회원 가입 요청창

import Modal from '../../assets/Modal'
import Button from '../../assets/Button';
import { useEffect, useState } from "react";
import { rtdb } from "../firebase/config";
import { ref, onValue, update } from "firebase/database";

const ROLE_OPTIONS = [
  { value: "user", label: "일반 사용자" },
  { value: "manager", label: "관리자(건물/설비)" },
  { value: "admin", label: "사이트 관리자" },
];

export default function JoinRequest(){
    

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(rtdb, "users");

    const unsub = onValue(usersRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, data]) => ({
        id,
        ...data,
      }));
      // pending만 필터
      setUsers(list.filter((u) => u.status === "pending"));
    });

    return () => unsub();
  }, []);

  const handleApprove = async (user, role) => {
    const userRef = ref(rtdb, `users/${user.id}`);
    await update(userRef, {
      status: "approved",
      role: role || "user",
      approvedAt: Date.now(),
      // approvedBy는 rules에서 email로 제한해두면 믿을 수 있음
    });
  };

  const handleReject = async (user) => {
    const userRef = ref(rtdb, `users/${user.id}`);
    await update(userRef, {
      status: "rejected",
    });
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, _selectedRole: newRole } : u
      )
    );
  };
    const [open, setOpen] =useState(false);
    return(
        <>
            <button onClick={()=>setOpen(true)}>모달열기</button>
            <Modal isOpen={open} onClose={()=>setOpen(false)}>
                <p className='text-[26px] font-pyeojin mt-[81px] ml-[66px]'>회원가입</p>
                <div className='w-[422px] h-[224px] bg-white ml-[66px] mt-[29px] mb-[15px] pt-[29px] px-[58px]'>
                    <div>
                        <label htmlFor="name">성명</label>
                        <input type="text" name='name' className='mt-[10px]' />
                    </div>
                    <div>
                        <label htmlFor="id">아이디</label>
                        <input type="text" name='id' className='mt-[10px]'/>
                    </div>
                    <div>
                        <label htmlFor="tel">전화번호</label>
                        <input type="text" name='tel' className='mt-[10px]'/>
                    </div>
                    <div>
                        <label htmlFor="permission">권한 설정</label>
                        <input type="radio" name='permission' value="admin"/> 관리인
                        <input type="radio" name='permission' value="none"/> 없음
                    </div>
                </div>
                <div>
                    <label htmlFor="pw" className='ml-[66px]'>비밀번호</label>
                    <input type="password" name='pw'/>
                </div>
                <Button>승인</Button>
            </Modal>
        </>
    );
}