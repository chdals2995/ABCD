import { useEffect, useState } from "react";
import { rtdb } from "../../../firebase/config";
import { ref, onValue } from "firebase/database";
import JoinRequest from "./JoinRequest";

export default function Member(){
    const [memberList, setMemberList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(()=>{
        const usersRef = ref(rtdb,"users");

        return onValue(usersRef, (snapshot) => {

            const data = snapshot.val();
            if (!data) return;

            const list = Object.entries(data)
                .filter(([uid, user]) => user.status === "approved") // 승인된 사용자만
                .map(([uid, user]) => ({ uid, ...user }));

            setMemberList(list);
        });
    },[]);
            const handleEdit = (user) => {
            setSelectedUser(user);
            setOpen(true);
        };

        const closeModal = () => {
            setSelectedUser(null);
            setOpen(false);
        };

    return(
        <>
            
            <div>
                <p className="text-[26px]">회원목록</p>
                <ul className="mt-[32px]">
                    {memberList.map((user) => (
                        <li key={user.uid}
                            className="group w-[777px] h-[52px] mb-[19px] text-[20px] bg-white
                                border-transparent border-2 hover:border-[2px] hover:border-[#054E76] rounded-[10px]
                                flex items-center justify-between">
                            <span className="ml-[73px] w-[120px] block border">{user.name}</span>
                            <span className="w-[280px] block border">{user.userId}</span>
                            <span className="mr-[130px]">관리인</span>
                            <button onClick={()=>handleEdit(user)}
                                className="hidden group-hover:block w-[79px] h-[52px] bg-[#054E76] text-white rounded-[10px]">수정</button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* 모달창 */}
            {selectedUser && (
            <JoinRequest user={selectedUser} open={open} close={closeModal} />
            )}
        </>
    );
}