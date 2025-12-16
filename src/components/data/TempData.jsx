//src/componenets/data/TempData.jsx
import Error from "./allData/Error";
import Tdata from "./allData/Tdata";
import Sdata from "./allData/Sdata";
import MaxData from "./allData/MaxData";

export default function TempData() {
  return (
    <div className="min-h-screen flex flex-col overflow-auto bg-[rgba(5,78,118,0.1)]">
      <div className="flex-1 flex justify-center items-center mt-[70px]">
        <div className="relative w-[1619px] h-[810px] bg-transparent">
          {/* 위쪽 3개 카드 */}
          <div className="absolute top-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mr-[8px]">
              <Error />
            </div>

            <div className="relative w-[529px] h-[390px] bg-white">
              {/* ✅ 기존: 일별 미리보기 */}
              <Sdata metricKey="temp" preview="day" showButtons={false} />   {/* ✅ 상단: 일별 미리보기 + 버튼 제거 */}
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px]">
              <Tdata metricKey="temp" showStatusColor={false} />
            </div>
          </div>

          {/* 아래쪽 3개 카드 */}
          <div className="absolute bottom-[5px] flex justify-center items-center w-[1619px] h-1/2 bg-transparent p-[5px]">
            <div className="relative w-[529px] h-[390px] bg-white mt-[3px]">
              {/* ✅ 추가: 월별 미리보기(좌측하단) */}
              <Sdata metricKey="temp" preview="month" showButtons={false} /> {/* ✅ 하단: 월별 미리보기 + 버튼 제거 */}
            </div>

            <div className="relative w-[529px] h-[390px] bg-white ml-[8px] mt-[3px]">
              <MaxData metricKey="temp" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
