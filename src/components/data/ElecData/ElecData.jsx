import { Link } from "react-router-dom";
import ElecError from "./ElecError";
import Tdata from "./Tdata";
import Pdata from "./Pdata";
import Sdata from "./Sdata";
import MaxData from "./MaxData";
import EmData from "./EmData";

export default function ElecData() {
  return (
    <div className="min-h-screen flex flex-col overflow-auto">
      {/* 상단 네비 */}
      <nav className="px-5 py-2.5 position top-[50px] left-[100px] z-99">
        <Link className="mr-5" to="/Data/WaterData">
          온도
        </Link>
        <Link className="mr-5" to="/Data/TempData">
          수도
        </Link>
        <Link className="mr-5" to="/Data/GasData">
          가스
        </Link>
      </nav>

      {/* 나머지 영역 전체에 카드들 가운데 배치 */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-[1619px] h-[810px] bg-transparent">
          {/* 위쪽 3개 카드 */}
          <div className="absolute top-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px]">
              <ElecError />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white">
              <Sdata />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px]">
              <Tdata />
            </div>
          </div>

          {/* 아래쪽 3개 카드 */}
          <div className="absolute bottom-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px] mt-[3px]">
              <Pdata />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white mt-[3px]">
              <EmData />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px] mt-[3px]">
              <MaxData />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  