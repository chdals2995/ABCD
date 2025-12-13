// MainPage
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
            <div>
                <ul className="w-[394px] flex justify-between font-pyeojin text-[28px]
                    absolute top-[81px] left-1/2 -translate-x-1/2 cursor-pointer">
                    <li>전력</li>
                    <li>온도</li>
                    <li>수도</li>
                    <li>가스</li>
                </ul>
                <div className="flex justify-between w-[745px] mx-auto mt-[30px]">
                    <MainBuilding/>
                    <MainPark/>
                </div>
            </div>
        </div>
    );
}