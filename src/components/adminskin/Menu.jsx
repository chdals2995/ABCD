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
            <div className='pt-[13px]'>
                <img src={logo} alt="홈" className='logo w-[216px] h-[84px] ml-[38px]'/>
            </div>
            <div className='wrap flex w-[450px]'>
                {/* 메뉴박스 */}
                <div className={`whiteBox w-[372px] h-full bg-white border-[#0888D4] border-2
                transition-transform duration-500 fixed top-0 left-0
                    ${open ? "translate-x-0" : "-translate-x-[372px]"} `}>
                    <img src={logo} alt="메뉴안로고" 
                        className='w-[216px] h-[84px] m-auto my-[20px]'/>
                    <div className='blueBox w-[318px] h-[600px] bg-[#E7F3F8] m-auto p-[15px]
                        border-[#0888D4] border-2'>
                        {/* 콘텐츠 */}
                        <div className='content'>
                            <span className='text-[20px] ml-[5px]'>안녕하세요! "아이디 님"</span>
                            <br></br>
                            <span className='ml-[210px] text-[#054E76]'>마이페이지</span>
                            {/* 페이지 */}
                            <ul className='px-[20px] mt-[30px]'>
                                <li className='mt-[20px]'>
                                    <div className='border-b-[1px] border-[#054E76]'>
                                        <span className='text-[20px] font-pyeojin'>홈</span>
                                    </div>
                                </li>
                                <li className='mt-[20px]'>
                                    <div className='Subtitle flex justify-between border-b-[1px] border-[#054E76]'>
                                        <span className='text-[20px] font-pyeojin'>층별 페이지</span>
                                        <div className="arrow w-3 h-3 border-l-2 border-b-2
                                            border-[#054E76] rotate-[-45deg] mt-[5px]"></div>
                                    </div>
                                    <ul className='ml-[40px] list-disc'>
                                        <div className='mt-[5px]'>
                                            <li>1층 - 10층</li>
                                            <li>11층 - 20층</li>
                                            <li>21층 -</li>
                                        </div>
                                    </ul>
                                </li>
                                <li className='mt-[20px]'>
                                    <div className='Subtitle flex justify-between border-b-[1px] border-[#054E76]'>
                                        <span className='text-[20px] font-pyeojin'>데이터 현황</span>
                                        <div className="arrow w-3 h-3 border-l-2 border-b-2
                                            border-[#054E76] rotate-[-45deg] mt-[5px]"></div>
                                    </div>
                                    <ul className='ml-[40px] list-disc'>
                                        <div className='mt-[5px]'>
                                            <li>전기</li>
                                            <li>온도</li>
                                            <li>수도</li>
                                            <li>가스</li>
                                        </div>
                                    </ul>
                                </li>
                                <li className='mt-[20px]'>
                                    <div className='Subtitle flex justify-between border-b-[1px] border-[#054E76]'>
                                        <span className='text-[20px] font-pyeojin'>문제 현황</span>
                                        <div className="arrow w-3 h-3 border-l-2 border-b-2
                                            border-[#054E76] rotate-[-45deg] mt-[5px]"></div>
                                    </div>
                                    <ul className='ml-[40px] list-disc'>
                                        <div className='mt-[5px]'>
                                            <li>전기</li>
                                            <li>온도</li>
                                            <li>수도</li>
                                            <li>가스</li>
                                        </div>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* 메뉴태그 */}
                <div className={`tag w-[78px] h-[51px] bg-[#0888D4] flex justify-end items-center mt-[60px]
                    transition-transform duration-500 fixed top-[100px] left-[372px]
                    ${open ? "translate-x-0" : "-translate-x-[372px]"}`}
                    onClick={show}>
                    <img src={logoW} alt="메뉴태그로고" 
                    className="w-[39px] h-[42px] block translate-x-[-10px]"/>
                </div>
            </div>
        </>
    );
}