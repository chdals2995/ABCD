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
                <p>회원목록</p>
                <ul>
                    {memberList.map((user) => (
                        <li key={user.uid}
                            className="group">
                            <span>{user.name}</span>
                            <span>{user.userId}</span>
                            <span>관리인</span>
                            <button onClick={()=>handleEdit(user)}
                                className="hidden group-hover:block">수정</button>
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