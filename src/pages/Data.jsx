// src/pages/Data.jsx
import GasData from "../components/data/GasData";
import TempData from "../components/data/TempData";
import WaterData from "../components/data/WaterData";
import {Routes, Route, Link} from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import ElecData from "../components/data/ElecData";

export default function Data(){

   return(
   <div>
      <div className="mb-[-100px]">
     <AdminLayout/>
    </div>
    <nav className="absolute left-[50%] top-[50px] z-99 translate-x-[-50%]">
              <Link className="mr-10 text-[32px]" to="/Data/ElecData">
                전력
              </Link>
              <Link className="mr-10 text-[32px]"  to="/Data/WaterData">
                온도
              </Link>
              <Link className="mr-10 text-[32px]" to="/Data/TempData">
                수도
              </Link>
              <Link className="mr-10 text-[32px]" to="/Data/GasData">
                가스
              </Link>
            </nav>
   <div className="w-full h-full bg-[rgba(5,78,118,0.1) bg-center">
     <Routes>   
      <Route path="ElecData" element={<ElecData/>}/>
      <Route path="WaterData" element={<WaterData/>}/>
      <Route path="TempData" element={<TempData/>}/>
      <Route path="GasData" element={<GasData/>}/>      
     </Routes>
   </div>
    
   </div>
   )
} 