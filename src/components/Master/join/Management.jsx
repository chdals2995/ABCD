// 사이트 관리자 페이지

import Member from "../join/Member"
import Building from "../building/Building";
import Elevator from "../elevator/Elevator";
import { useState } from "react";

export default function Management() {
  const [tab, setTab] = useState("A");

  return (
    <>
      <div className="text-[36px] text-[#054E76] font-pyeojin w-[195px] m-auto">
        사이트 관리자
      </div>
      <div className="mx-auto w-[996px] mt-[73px]">
        {/* 탭메뉴 */}
        <ul className="flex items-center justify-center">
          <li
            className={`TabMenu w-[333px] h-[82px] border-3 border-[#054E76] text-white
              text-[32px] font-pyeojin text-center pt-[15px]
              ${tab==='A' ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("A")}
          >
            회원관리
          </li>
          <li
            className={`TabMenu w-[333px] h-[82px] text-white
              text-[32px] font-pyeojin text-center pt-[15px]
            border-3 border-l-transparent border-r-transparent border-[#054E76]
            ${tab==='B' ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("B")}
          >
            건물등록
          </li>
          <li
            className={`TabMenu w-[333px] h-[82px] border-3 border-[#054E76] text-white
              text-[32px] font-pyeojin text-center pt-[15px]
            ${tab==='C' ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("C")}
          >
            승강기
          </li>
        </ul>
        {/* 탭 내용 */}
        <div className="TabBox w-[996px] h-[546px] border-2 border-t-transparent bg-[#E7F3F8]">
          {tab === "A" && <Member />}
          {tab === "B" && <Building />}
          {tab === "C" && <Elevator />}
        </div>
      </div>
    </>
  );
}
