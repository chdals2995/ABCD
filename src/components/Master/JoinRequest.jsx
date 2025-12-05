//  회원 가입 요청창

import Modal from '../../assets/Modal'
import Button from '../../assets/Button';

export default function JoinRequest(){
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
                <Button className="m-auto">승인</Button>
            </Modal>
        </>
    );
}