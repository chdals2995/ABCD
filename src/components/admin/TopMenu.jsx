import login from '../../assets/icons/login.png';
import alert from '../../assets/icons/alert.png';
import alarm from '../../assets/icons/alarm.png';

export default function TopMenu(){
    return(
        <>
            <div 
            className="TopMenu w-[372px] h-[68px] px-[74px] bg-[#0888D4] 
                absolute top-0 right-0 flex items-center justify-between ">
                    <img src={login} alt="마이페이지" className='w-[48px] h-[48px]'/>
                    <img src={alert} alt="문제보기" className='w-[48px] h-[48px]'/>
                    <img src={alarm} alt="알림보기" className='w-[42px] h-[48px]'/>
            </div>
        </>
    );
}