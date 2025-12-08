// src/pages/Floors.jsx
import FloorsElecData from "../components/floors/FloorsElecData";
import FloorsGasData from "../components/floors/FloorsGasData";
import FloorsTempData from "../components/floors/FloorsTempData";
import FloorsWaterData from "../components/floors/FloorsWaterData";
import AdminLayout from "../layout/AdminLayout";

export default function Floors() {
  return (
    <div className="relative h-screen w-screen">
      {/* 👉 왼/오 배경 (맨 뒤) */}
      <div className="absolute inset-0 flex z-0">
        <div className="w-[554px] bg-[#E7F3F8] relative">
          <div className="absolute w-[411px] right-[47px] bg-[red] top-[170px] ">
            <FloorsElecData />
            <FloorsTempData />
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="w-[554px] bg-[#E7F3F8] relative">
          <div className="absolute w-[411px] left-[47px] bg-[red] top-[170px]">
            <FloorsWaterData />
            <FloorsGasData />
          </div>
        </div>
      </div>

      {/* 👉 실제 레이아웃 (앞) */}
      <div className="relative z-10">
        <AdminLayout />
      </div>
    </div>
  );
}
