import { Link } from "react-router-dom";

export default function WaterData() {
  return (
    <div className="min-h-screen flex flex-col bg-[rgba(5,78,118,0.1)] overflow-auto">
      {/* 상단 네비 */}
      <nav style={{ padding: "10px 20px" }}>
        <Link style={{ marginRight: "20px" }} to="/Data/ElecData">
          전력
        </Link>
        <Link style={{ marginRight: "20px" }} to="/Data/TempData">
          온도
        </Link>
        <Link style={{ marginRight: "20px" }} to="/Data/GasData">
         가스
        </Link>
      </nav>

      {/* 나머지 영역 전체에 카드들 가운데 배치 */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-[1619px] h-[810px] bg-transparent">
          {/* 위쪽 3개 카드 */}
          <div className="absolute top-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px]">
              
            </div>

            <div className="relative w-[529px] h-[390px] bg-white">
              
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px]">
              
            </div>
          </div>

          {/* 아래쪽 3개 카드 */}
          <div className="absolute bottom-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px] mt-[3px]">
              
            </div>

            <div className="relative w-[529px] h-[390px] bg-white mt-[3px]">
              
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px] mt-[3px]">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  