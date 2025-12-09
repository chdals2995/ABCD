import ElecData from "../components/data/ElecData/ElecData";
import GasData from "../components/data/GasData/GasData";
import TempData from "../components/data/TempData/TempData";
import WaterData from "../components/data/WaterData/WaterData";
import {Routes, Route} from "react-router-dom";
export default function Data(){

   return(
   <Routes>
      <Route path="ElecData" element={<ElecData/>}/>
      <Route path="WaterData" element={<WaterData/>}/>
      <Route path="TempData" element={<TempData/>}/>
      <Route path="GasData" element={<GasData/>}/>
   </Routes>
   )
} 