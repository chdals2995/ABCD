// 사이트 관리자 페이지

import Member from '../Master/Member';

export default function Management(){
    return(
        <>
            <div>사이트 관리자</div>
            <div className="m-auto w-[996px]">
                <ul className="flex items-center justify-center">
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]">회원관리</li>
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]">건물등록</li>
                    <li className="TabMenu w-[333px] h-[82px] border-3 border-[#054E76]">승강기</li>
                </ul>
                <div className="TabBox w-[996px] h-[546px] border-2">
                    
                </div>
            </div>
        </>
    );
}