import { useState } from "react";
import DataModal from "../DataModal";
import CloseButton from "../../../assets/CloseButton";
import AggBarChart from "../common/AggBarChart";
import AggTable from "../common/AggTable";
import { useAggSeries } from "../../../hooks/dataPage/useAggSeries";
import { metricConfig } from "../metricConfig";

export default function Sdata({ metricKey = "elec" }) {
  const cfg = metricConfig[metricKey] ?? metricConfig.elec; // ✅ cfg 방어

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("day"); // "day" | "month"

  const dayRes =
    useAggSeries({
      path: cfg.day.path,
      limit: cfg.day.limit,
      sumField: cfg.day.sumField,
      scale: cfg.day.scale,
      keyType: "day",
    }) || {};

  const monthRes =
    useAggSeries({
      path: cfg.month.path,
      limit: cfg.month.limit,
      sumField: cfg.month.sumField,
      scale: cfg.month.scale,
      keyType: "month",
    }) || {};

  // ✅ rows/labels는 무조건 배열로 보장
  const dayRows = Array.isArray(dayRes.rows) ? dayRes.rows : [];
  const dayLabels = Array.isArray(dayRes.labels) ? dayRes.labels : [];
  const monthRows = Array.isArray(monthRes.rows) ? monthRes.rows : [];
  const monthLabels = Array.isArray(monthRes.labels) ? monthRes.labels : [];

  const activeRows = mode === "day" ? dayRows : monthRows;
  const activeLabels = mode === "day" ? dayLabels : monthLabels;
  const activeLoading = mode === "day" ? !!dayRes.loading : !!monthRes.loading;
  const activeCfg = mode === "day" ? cfg.day : cfg.month;

  const openDayModal = () => {
    setMode("day");
    setIsOpen(true);
  };
  const openMonthModal = () => {
    setMode("month");
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  return (
    <div className="flex h-full flex-col text-sm p-10">
      <div className="mb-1 absolute top-[20px] left-[10px]">
        <h2 className="font-semibold text-base">(건물){cfg.label} 사용량 그래프</h2>
      </div>

      <div className="space-x-2 absolute top-[20px] right-[10px]">
        <button
          onClick={openDayModal}
          className="px-[10px] py-[8px] bg-[#FFEE69] text-[16px] rounded-[10px] shadow-md font-medium"
        >
          단위(일)
        </button>
        <button
          onClick={openMonthModal}
          className="px-[10px] py-[8px] bg-[#FFEE69] text-[16px] rounded-[10px] shadow-md font-medium"
        >
          단위(월)
        </button>
      </div>

      <DataModal isOpen={isOpen} onClose={closeModal}>
        <div className="relative flex flex-col w-full h-full max-w-[1000px] mx-auto md:mt-15">
          <div className="absolute right-2 top-2 md:right-[-55px] md:top-[-45px]">
            <CloseButton onClick={closeModal} />
          </div>

          <div className="flex items-start justify-between px-3 md:px-6 pt-1 md:pt-2">
            <div className="flex">
              <button
                type="button"
                onClick={() => setMode("day")}
                className={`px-4 md:px-6 py-2 text-sm font-semibold border border-[#054E76] rounded-t-md ${
                  mode === "day" ? "bg-white text-[#054E76] border-white" : "bg-[#054E76] text-[#FFFFFF]"
                }`}
              >
                일별
              </button>
              <button
                type="button"
                onClick={() => setMode("month")}
                className={`px-4 md:px-6 py-2 text-sm font-semibold border border-[#054E76] rounded-t-md -ml-[1px] ${
                  mode === "month" ? "bg-white text-[#054E76] border-white" : "bg-[#054E76] text-[#FFFFFF]"
                }`}
              >
                월별
              </button>
            </div>
          </div>

          <div className="flex-1 px-3 md:px-6 pb-2 md:pb-3 bg-transparent">
            <div className="bg-[#ffffff] w-full h-8/9 px-4 md:px-8 pt-4 md:pt-6 pb-4 flex flex-col overflow-y-auto">
              <h3 className="text-base md:text-lg font-semibold mb-4">
                {mode === "day" ? "일별 그래프(주 단위)" : "월별 그래프(월 단위)"}
              </h3>

              <div className="flex flex-col md:flex-row gap-4 md:gap-10">
                <div className="text-xs md:text-sm mt-2 md:mt-4">
                  <div className="mb-2 font-semibold">범례</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-4 bg-[#414141]" />
                    <span>위험</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-4 bg-[#E54138]" />
                    <span>주의</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-[#F3D21B]" />
                    <span>정상</span>
                  </div>
                </div>

                <div className="flex-1 h-[220px] md:h-[280px] lg:h-[325px]">
                  {activeLoading ? (
                    <p className="text-xs text-gray-500">로딩중...</p>
                  ) : activeRows.length === 0 ? (
                    <p className="text-xs text-gray-500">데이터가 없습니다.</p>
                  ) : (
                    <AggBarChart
                      title={`${cfg.label} 사용량`}
                      labels={activeLabels}
                      rows={activeRows}
                      yMin={activeCfg.y.min}
                      yMax={activeCfg.y.max}
                      thresholds={activeCfg.thresholds}
                      unitLabel={`단위(${cfg.unit})`}
                    />
                  )}
                </div>
              </div>

              {mode === "day" && (
                <AggTable labels={dayLabels} rows={dayRows} leftHeader="사용량" suffix={cfg.day.suffix} />
              )}
              {mode === "month" && (
                <AggTable labels={monthLabels} rows={monthRows} leftHeader="사용량" suffix={cfg.month.suffix} />
              )}
            </div>
          </div>
        </div>
      </DataModal>  

      {/* 페이지 안의 작은 차트(일단 day 기준) */}
      <div className="w-[500px] h-[300px] absolute top-[55%] left-[50%] translate-x-[-52%] translate-y-[-50%]">
        {!isOpen && !dayRes.loading && dayRows.length > 0 && (
          <AggBarChart
            title={`${cfg.label} 사용량`}
            labels={dayLabels}
            rows={dayRows}
            yMin={cfg.day.y.min}
            yMax={cfg.day.y.max}
            thresholds={cfg.day.thresholds}
            unitLabel={`단위(${cfg.unit})`}
          />
        )}
      </div>
    </div>
  );
}
