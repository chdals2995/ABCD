// MainPage
import AdminLayout from "../layout/AdminLayout";
import MainBuilding from "../components/main/MainBuilding";
import MainPark from "../components/main/MainPark";
import MainLogo from "../assets/logos/mainlogo.png";

export default function MainPage(){
    return(
<<<<<<< HEAD
        <>
         <h2>임시 메인페이쥐</h2>
         <AuthStatus></AuthStatus>
         <nav>
          <Link to="/Data/ElecData" style={{marginRight:"10px"}}>전력</Link>
          <Link to="/Data/WaterData" style={{marginRight:"10px"}}>수도</Link>
          <Link to="/Data/TempData">온도</Link>
         </nav>
        </>
    )
=======
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
>>>>>>> a2881fa7d07b7f3d1f4371e96ab01417ef69c738
}