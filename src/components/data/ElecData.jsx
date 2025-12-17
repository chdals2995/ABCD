//src/components/ElecData.jsx
import Error from "./allData/Error"
import Tdata from "./allData/Tdata";
import Pdata from "./allData/Pdata";
import Sdata from "./allData/Sdata";
import MaxData from "./allData/MaxData";
import EmData from "./allData/EmData";

export default function ElecData() {
  return (
    <div className="min-h-screen flex flex-col overflow-auto bg-[rgba(5,78,118,0.1)]">
      {/* 상단 네비 */}
    
      {/* 나머지 영역 전체에 카드들 가운데 배치 */}
      <div className="flex-1 flex justify-center items-center mt-[70px]">
        <div className="relative w-[1619px] h-[810px] bg-transparent">
          {/* 위쪽 3개 카드 */}
          <div className="absolute top-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px] rounded-xl border-white">
              <Error metricKey="elec"/>
            </div>

            <div className="relative w-[529px] h-[390px] bg-white">
              <h2 className="font-semibold text-base mt-[20px] ml-[10px]">
               (건물) 실시간 전력 사용량 그래프
              </h2>
              <Tdata metricKey="elec" />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px]">
             <div className="mb-1 absolute top-[20px] left-[10px]">
              <h2 className="font-semibold text-base">(건물)전력 사용량 그래프</h2>
             </div>
             <Sdata metricKey="elec" /> 
            </div>
          </div>

          {/* 아래쪽 3개 카드 */}
          <div className="absolute bottom-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px] mt-[3px]">
              <Pdata metricKey="elec" />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white mt-[3px]">
              <EmData metricKey="elec" />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px] mt-[3px]">
              <MaxData  metricKey="elec"
                        placeKeysPath="aggDay"
                        dayPerPlacePath="aggDay" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  