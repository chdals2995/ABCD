// src/pages/Data.jsx
import GasData from "../components/data/GasData";
import TempData from "../components/data/TempData";
import WaterData from "../components/data/WaterData";
import { Routes, Route, NavLink } from "react-router-dom"; // useLocation 좌측 상단 로고의 네비용(임시)
import AdminLayout from "../layout/AdminLayout";
import ElecData from "../components/data/ElecData";


export default function Data() {
  const baseClass = "mr-10 text-[32px]";
  const activeClass = "text-[#054E76] font-bold";     // ✅ 활성일 때 색
  const inactiveClass = "text-gray-500";              // ✅ 비활성일 때 색

  return (
    <div className="min-h-screen flex flex-col bg-[rgba(5,78,118,0.1)] relative z-[9999]">
      <div className="mb-[-120px]">          
            <AdminLayout/>
      </div>

      <nav className="absolute left-1/2 top-[30px] z-50 -translate-x-1/2">
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

      <div className="flex-1">
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
