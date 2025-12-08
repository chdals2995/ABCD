import AdminLayout from "../layout/AdminLayout";
import Todo from "../components/adminpage/Todo";
import EnergyData from "../components/adminpage/EnergyData";
import MemberList from "../components/adminpage/MemberList";
import Notice from "../components/adminpage/Notice";
import Vacant from "../components/adminpage/Vacant";
import TestEnergyData from "../components/adminpage/TestEnergyData";

export default function AdminPage() {
   return (
      <>
         <h1 className="font-bold text-[36px] font-pyeojin absolute top-6 left-1/2 -translate-x-1/2 text-[#003C5B] ">
            건물 관리자
         </h1>
         <AdminLayout />
         <Todo />
         <div className="w-[1255px] h-[776px] grid grid-cols-[553px_665px] gap-x-[38px] gap-y-[36px] ml-[180px] mt-[60px]">
            <EnergyData />
            <MemberList />
            <Vacant />
            <Notice />
         </div>
         {/* <TestEnergyData /> */}
      </>
   );
}
