import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, onValue } from "firebase/database";


export default function JoinRequestList({onSelectUser}){
    const [pendingList, setPendingList] = useState([]);

    useEffect(() => {
        const userRef = ref(rtdb, "users");

        onValue(userRef, (snapshot) => {
        const data = snapshot.val() || {};

        const pending = Object.keys(data)
            .filter((uid) => data[uid].status === "pending")
            .map((uid) => ({
            uid,
            ...data[uid],
            }));

        setPendingList(pending);
        });
    }, []);

    return(
        <div className="w-[372px] h-full px-[27px] bg-[#E7F3F8] border-[#0888D4]
            absolute right-0 top-[68px] pt-[30px] pl-[27px]">
            <p className="text-[24px] font-pyeojin">가입 신청 내역</p>
            <div className="w-[318px] h-[600px] bg-white m-auto mt-[79px]">
                <ul>
                    {pendingList.map((user) => (
                        <li
                        key={user.uid}
                        onClick={() => onSelectUser(user)}
                        className=""
                        >
                        {user.name} / 관리자 가입 신청
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}