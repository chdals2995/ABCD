import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";
import JoinRequest from "./JoinRequest";

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
        className="w-[372px] h-full px-[27px] bg-[#E7F3F8] border-[#0888D4]
                absolute right-0 top-[68px] pt-[30px] pl-[27px]"
      >
        <p className="text-[24px] font-pyeojin">가입 신청 내역</p>
        <div className="w-[318px] h-[600px] bg-white m-auto mt-[30px] px-[14px] pt-[17px]">
          <ul>
            {pendingList.map((user) => (
              <li
                key={user.uid}
                onClick={() => openUserModal(user)}
                className="text=[18px] cursor-pointer border-b-0 hover:border-b-[2px] hover:border-b-[#054E76]"
              >
                {user.name} / 관리자 가입 신청
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* 회원 요청 모달창 */}
      {selectedUser && (
        <JoinRequest user={selectedUser} open={open} close={closeUserModal} />
      )}
    </>
  );
}
