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
          to="/data/elecData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          전력
        </NavLink>

        <NavLink
          to="/data/tempData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          온도
        </NavLink>

        <NavLink
          to="/data/waterData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          수도
        </NavLink>

        <NavLink
          to="/data/gasData"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          가스
        </NavLink>
      </nav>

      <div className="w-full h-full bg-[rgba(5,78,118,0.1)] bg-center">
        <Routes>
          <Route path="elecData" element={<ElecData />} />
          <Route path="waterData" element={<WaterData />} />
          <Route path="tempData" element={<TempData />} />
          <Route path="gasData" element={<GasData />} />
        </Routes>
      </div>
    </div>
  );
}
