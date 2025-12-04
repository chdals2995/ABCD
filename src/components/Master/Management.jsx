// 사이트 관리자 페이지

import Member from '../Master/Member';
import Building from '../Master/Building';
import Elevator from '../Master/Elevator';
import { useState } from 'react';

export default function Management(){
    const [tab, setTab] = useState('A');

    return(
        <>
            <div>사이트 관리자</div>
            <div className="m-auto w-[996px]">
                <ul className="flex items-center justify-center">
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]"
                        onClick={()=> setTab('A')}>회원관리</li>
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]"
                        onClick={()=> setTab('B')}>건물등록</li>
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]"
                        onClick={()=> setTab('C')}>승강기</li>
                </ul>
                <div className="TabBox w-[996px] h-[546px] border-2">
                    {tab === "A" && <Member/>}
                    {tab === "B" && <Building/>}
                    {tab === "C" && <Elevator/>}
                </div>
            </div>
        </>
    );
}