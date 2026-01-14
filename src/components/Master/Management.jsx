// src/components/Master/Management.jsx

import Member from "./join/Member";
import Building from "./building/Building";
import Elevator from "./elevator/Elevator";
import JoinRequestList from "./join/JoinRequestList";
import BuildingLog from "./building/BuildingLog";
import ElevatorLog from "./elevator/ElevatorLog";

import Parking from "./parking/Parking";
import ParkingLog from "./parking/ParkingLog";

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
            className={`w-[249px] h-[82px] border-3 border-[#054E76] text-white
              text-[32px] font-pyeojin text-center pt-[15px] cursor-pointer
              ${tab === "A" ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("A")}
          >
            회원관리
          </li>

          <li
            className={`w-[249px] h-[82px] text-white
              text-[32px] font-pyeojin text-center pt-[15px]
              border-3 border-l-transparent border-[#054E76] cursor-pointer
              ${tab === "B" ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("B")}
          >
            건물등록
          </li>

          <li
            className={`w-[249px] h-[82px] text-white
              text-[32px] font-pyeojin text-center pt-[15px]
              border-3 border-l-transparent border-[#054E76] cursor-pointer
              ${tab === "D" ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("D")}
          >
            주차장
          </li>

          <li
            className={`w-[249px] h-[82px] border-3 border-l-transparent border-[#054E76] text-white
              text-[32px] font-pyeojin text-center pt-[15px] cursor-pointer
              ${tab === "C" ? "bg-[#054E76]" : "bg-[#0888D4]"}`}
            onClick={() => setTab("C")}
          >
            승강기
          </li>
        </ul>

        {/* 탭 내용 */}
        <div
          className="w-[996px] h-[546px] border-2 border-t-transparent bg-[#E7F3F8]
          py-[49px] px-[111px]"
        >
          {tab === "A" && <Member />}
          {tab === "B" && <Building />}
          {tab === "D" && <Parking />}
          {tab === "C" && <Elevator />}
        </div>

        {/* 해당 탭 우측 내역 */}
        {tab === "A" && <JoinRequestList />}
        {tab === "B" && <BuildingLog />}
        {tab === "D" && <ParkingLog />}
        {tab === "C" && <ElevatorLog />}
      </div>
    </>
  );
}
