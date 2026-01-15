// joinRequestList.jsx
import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue, remove } from "firebase/database";
import JoinRequest from "./JoinRequest";
import redtrash from "../../../assets/icons/redtrash.png"

export default function JoinRequestList() {
  const [pendingList, setPendingList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const openUserModal = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const closeUserModal = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // 삭제
  const handleDeleteUser = (e, uid) => {
    e.stopPropagation();

    if (!confirm("정말 삭제하시겠습니까?")) return;

    remove(ref(rtdb, `users/${uid}`));
  };

  useEffect(() => {
    const usersRef = ref(rtdb, "users");

    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const list = Object.entries(data)
        .filter(([uid, user]) => user.status === "pending")
        .map(([uid, user]) => ({ uid, ...user }));

      setPendingList(list);
    });
  }, []);

  return (
    <>
      <div
        className="w-[372px] h-[885px] px-[27px] bg-[#E7F3F8] border-[#0888D4]
                absolute right-0 top-[68px] pt-[30px] pl-[27px]"
      >
        <p className="text-[24px] font-pyeojin">가입 신청 내역</p>
        <div className="w-[318px] h-[600px] bg-white m-auto mt-[30px] px-[14px] pt-[7px]">
          <ul>
            {pendingList.map((user) => (
              <li
                key={user.uid}
                onClick={() => openUserModal(user)}
                className="group text-[18px] mt-[10px] cursor-pointer border-b-[2px] border-transparent 
                  hover:border-b-[2px] hover:border-b-[#054E76] hover:font-bold
                  flex justify-between"
              >
                {user.name} / 관리자 가입 신청
                <button onClick={(e) => handleDeleteUser(e, user.uid)}
                  className="opacity-0 group-hover:opacity-100 cursor-pointer">
                  <img src={redtrash} alt="삭제" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* 회원 요청 모달창 */}
      <JoinRequest user={selectedUser} open={open} close={closeUserModal} buttonName={"승인"}/>
    
    </>
  );
}
