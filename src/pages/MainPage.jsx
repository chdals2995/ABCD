import AdminLayout from "../layout/AdminLayout";
import MainBuilding from "../components/main/MainBuilding";
import MainPark from "../components/main/MainPark";
import MainLogo from "../assets/logos/mainlogo.png";

export default function MainPage(){
    return(
        // 배경화면
        <div className="bg-[url('./assets/imgs/background.png')] bg-cover bg-center h-screen">
            {/* 스킨과 로고변경 */}
            <AdminLayout MainLogo={MainLogo}
                logoSize="w-[290px] h-[113px]"/>
            {/* 건물 */}
            <div className="flex justify-between w-[745px] mx-auto mt-[30px]">
                <MainBuilding/>
                <MainPark/>
            </div>
        </div>
    );
}