import ElecData from "../components/data/ElecData/ElecData";
import GasData from "../components/data/GasData/GasData";
import TempData from "../components/data/TempData/TempData";
import WaterData from "../components/data/WaterData/WaterData";
import {Routes, Route} from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";

export default function Data(){

   return(
   <div className="bg-transparent bg-center">
    <div className="mb-[-100px]">
     <AdminLayout/>
    </div>
   <div className="absolute z-[-10] left-[50%] transform -translate-x-1/2 bg-[rgba(5,78,118,0.1)] w-full h-full">
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