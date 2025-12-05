//  회원 가입 요청창

import Modal from '../../assets/Modal'
import Button from '../../assets/Button';
import { useState } from "react";
import { rtdb } from "../../firebase/config";
import { ref, update } from "firebase/database";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function JoinRequest({ user, close }){

  const [role, setRole] = useState("admin"); // 기본값

  const handleApprove = async () => {
    const userRef = ref(rtdb, `users/${user.uid}`);


    await update(userRef, {
      status: "approved",
      role: role,
      approvedAt: Date.now(),
      approvedBy: "ADMIN_UID_여기넣기"  // 실제 로그인 관리자 uid 넣어야 함
    });
    close();
  
  };

    return(
        <>
            <button onClick={()=>setOpen(true)}>모달열기</button>
            <Modal isOpen={open} onClose={()=>setOpen(false)}>
                <p className='text-[26px] font-pyeojin mt-[71px] ml-[66px]'>회원가입</p>
                <div className="w-[422px] h-[224px] bg-white 
                  ml-[66px] mt-[19px] pt-[38px] px-[66px] rounded-[10px]
                  shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
                  flex justify-between">
                    <div className='flex flex-col items-end w-[75px]'>
                        <label htmlFor="name" className='text-[20px] mb-[10px]'>성명</label>
                        <label htmlFor="id" className='text-[20px] mb-[10px]'>아이디</label>
                        <label htmlFor="tel" className='text-[20px] mb-[10px]'>전화번호</label>
                        <label htmlFor="permission" className='text-[20px] mb-[10px]'>권한 설정</label>
                    </div>
                    <div className='w-[192px]'>
                        <input type="text" name='name' className='w-full mb-[13px]' value={user.name}/>
                        <input type="text" name='id' className='w-full mb-[13px]' value={user.userID}/>
                        <input type="text" name='tel' className='w-full mb-[14px]' value={user.phone}/>
                        <div className='w-full flex justify-between'>
                          <input type="radio" name='permission' value="admin" checked={role === "admin"}
                          onChange={() => setRole("admin")}/> 관리인
                          <input type="radio" name='permission' value="none" className='ml-[60px]'
                          checked={role === "none"}
                          onChange={()=>setRole("none")}/> 없음
                        </div>
                    </div>   
                </div>
                <div className='mt-[15px] w-[290px] mx-auto'>
                    <label htmlFor="pw" className='text-[20px]'>비밀번호</label>
                    <input type="password" name='pw' className='w-[192px] ml-[28px] !border-[#054E76]'/>
                </div>
                <div className='w-[79px] mx-auto mt-[29px]'>
                  <Button onClick={handleApprove}>승인</Button>
                </div>
            </Modal>
        </>
    );
}