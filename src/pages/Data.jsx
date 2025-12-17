// src/pages/Data.jsx
import GasData from "../components/data/GasData";
import TempData from "../components/data/TempData";
import WaterData from "../components/data/WaterData";
import { Routes, Route, NavLink } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import ElecData from "../components/data/ElecData";

export default function Data() {
  const baseClass = "mr-10 text-[32px]";
  const activeClass = "text-[#054E76] font-bold";     // ✅ 활성일 때 색
  const inactiveClass = "text-gray-500";              // ✅ 비활성일 때 색

  return (
    <div>
      <div className="mb-[-100px]">
        <AdminLayout />
      </div>

      <nav className="absolute left-[50%] top-[50px] z-99 translate-x-[-50%]">
        <NavLink
          to="/Data/ElecData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          전력
        </NavLink>

        <NavLink
          to="/Data/TempData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          온도
        </NavLink>

        <NavLink
          to="/Data/WaterData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          수도
        </NavLink>

        <NavLink
          to="/Data/GasData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          가스
        </NavLink>
      </nav>

      <div className="w-full h-full bg-[rgba(5,78,118,0.1)] bg-center">
        <Routes>
          <Route path="ElecData" element={<ElecData />} />
          <Route path="WaterData" element={<WaterData />} />
          <Route path="TempData" element={<TempData />} />
          <Route path="GasData" element={<GasData />} />
        </Routes>
      </div>
    </div>
  );
}
