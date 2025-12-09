import ElecData from "../components/data/ElecData/ElecData";
import GasData from "../components/data/GasData/GasData";
import TempData from "../components/data/TempData/TempData";
import WaterData from "../components/data/WaterData/WaterData";
import {Routes, Route} from "react-router-dom";
export default function Data(){

   return(
   <Routes>
      <Route path="/Data/ElecData" element={<ElecData/>}/>
      <Route path="/Data/WaterData" element={<WaterData/>}/>
              <Route path="/Data/TempData" element={<TempData/>}/>
              <Route path="/Data/GasData" element={<GasData/>}/>
   </Routes>
   )
} 