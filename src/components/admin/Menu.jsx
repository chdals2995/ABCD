import logoW from '../../assets/logos/logoW.png';
import logo from '../../assets/logos/logo.png';
import { useState } from 'react';

export default function Menu(){
    const [open, setOpen] = useState(false);

    const show = () => {
        setOpen(!open);
    };

    return(
        <>
            <div className='wrap flex'>
                {/* 메뉴박스 */}
                <div className={`whiteBox w-[372px] h-full bg-white transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}`}>
                    <img src={logo} alt="메뉴로고" 
                        className='w-[216px] h-[84px] translate-x-[47px]'/>
                    <div className='blueBox w-[318px] h-[720px] bg-[#E6EEF2]'>
                        {/* 콘텐츠 */}
                        <div className='content'>
                            <span>안녕하세요! "아이디"님</span>
                            <span>마이페이지</span>
                            <ul>
                                <li>
                                    <span>홈</span><span className="arrow"></span>
                                </li>
                                <li><span>층별 페이지</span><span className="arrow"></span>
                                    <ul>
                                        <li>1층 - 10층</li>
                                        <li>11층 - 20층</li>
                                        <li>21층 -</li>
                                    </ul>
                                </li>
                                <li><span>데이터 현황</span><span className="arrow"></span>
                                    <ul>
                                        <li>전기</li>
                                        <li>온도</li>
                                        <li>수도</li>
                                        <li>가스</li>
                                    </ul>
                                </li>
                                <li><span>문제 현황</span><span className="arrow"></span>
                                    <ul>
                                        <li>전기</li>
                                        <li>온도</li>
                                        <li>수도</li>
                                        <li>가스</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* 메뉴태그 */}
                <div className={`tag w-[78px] h-[51px] bg-[#0888D4] flex justify-end items-center translate-y-[181px]
                    transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-[372px]"}`}
                    onClick={show}>
                    <img src={logoW} alt="메뉴태그로고" 
                    className="w-[39px] h-[42px] block translate-x-[-10px]"/>
                </div>
            </div>
        </>
    );
}