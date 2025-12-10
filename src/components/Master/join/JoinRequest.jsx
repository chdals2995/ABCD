//  회원 가입 요청창
// joinRequest.jsx
import Close from '../../../assets/icons/close.png';
import Modal from '../../../assets/Modal'
import Button from '../../../assets/Button';
import { useState } from "react";
import { rtdb, auth } from "../../../firebase/config";
import { ref, update } from "firebase/database";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";


export default function JoinRequest({ user, open, close ,buttonName}){
  if (!open || !user) return null;

  const [role, setRole] = useState("admin"); // 기본값
  const [adminPw, setAdminPw] = useState("");
  const [error, setError] = useState("");

  const handleApprove = async () => {
    
    setError("");

    try {
      const master = auth.currentUser;

      if (!master) {
        setError("마스터 계정으로 로그인해야 합니다.");
        return;
      }

      // 마스터 비밀번호 검증
      const credential = EmailAuthProvider.credential(
        master.email,adminPw);

      // 비밀번호 확인
      await reauthenticateWithCredential(master, credential);

     
      //승인 처리
      const userRef = ref(rtdb, `users/${user.uid}`); 

    await update(userRef, {
      status: "approved",
      role: role,
      approvedAt: Date.now(),
      approvedBy: master.uid
    });
    close();
  
  }catch (err) {
      console.error(err);
       setError("비밀번호가 틀렸습니다.");
    }
  };

    return(
        <>
            <Modal isOpen={open} onClose={close} >
              {/* 제목과 닫기 */}
              <div className='ml-[66px] relative'>
                <p className='text-[26px] font-pyeojin mt-[71px]'>회원가입</p>
                <img src={Close} alt="닫기" className='w-[41px] h-[41px] absolute top-3 right-3'
                onClick={()=>close()}/>
              </div>
              {/* 회원 정보 */}
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
                        <input type="text" name='name' className='w-full mb-[13px]' value={user.name} readOnly/>
                        <input type="text" name='id' className='w-full mb-[13px]' value={user.userId} readOnly/>
                        <input type="text" name='tel' className='w-full mb-[14px]' value={user.phone} readOnly/>
                        {/* 권한설정 */}
                        <div className='w-full flex justify-between'>
                          <input type="radio" name='permission' value="admin" 
                          checked={role === "admin"}
                          onChange={() => setRole("admin")}/> 관리인
                          <input type="radio" name='permission' value="none" className='ml-[60px]'
                          checked={role === "none"}
                          onChange={()=>setRole("none")}/> 없음
                        </div>
                    </div>   
                </div>
                {/* 관리자 비밀번호 확인 */}
                <div className='mt-[15px] w-[290px] mx-auto'>
                    <label htmlFor="pw" className='text-[20px]'>비밀번호</label>
                    <input type="password" name='pw' className='w-[192px] ml-[28px] !border-[#054E76]'
                    value={adminPw}
                    onChange={(e) => setAdminPw(e.target.value)}/>
                </div>
                {/* 에러 메시지 */}
                {error && (
                  <p className="text-red-500 text-center mt-2">{error}</p>
                )}
                {/* 승인버튼 */}
                <div className='w-[79px] mx-auto mt-[29px]'>
                  <Button onClick={handleApprove}>{buttonName}</Button>
                </div>
            </Modal>
        </>
    );
}