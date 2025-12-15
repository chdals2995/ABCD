import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "../assets/icons/calendar_icon.png";
import { ko } from "date-fns/locale";


/* =========================
   날짜 유틸
========================= */
function toDate(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function getQuarterFromDate(date) {
  const month = date.getMonth() + 1;
  if (month <= 3) return "1분기";
  if (month <= 6) return "2분기";
  if (month <= 9) return "3분기";
  return "4분기";
}

function diffDaysInclusive(start, end) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

/* =========================
   Component
========================= */
export default function QuarterData({
  items = [],
  selectedMetric = "전력",
  startDate,
  endDate,
}) {
  /* 날짜 선택용 로컬 상태 */
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  /* 분기 계산 */
  const stats = useMemo(() => {
    const base = {
      "1분기": { count: 0, avgPerDay: 0 },
      "2분기": { count: 0, avgPerDay: 0 },
      "3분기": { count: 0, avgPerDay: 0 },
      "4분기": { count: 0, avgPerDay: 0 },
      total: 0,
      periodDays: 0,
    };

    const s = toDate(localStart);
    const e = toDate(localEnd);
    if (!s || !e) return base;

    const periodDays = diffDaysInclusive(s, e);
    if (periodDays <= 0) return base;

    for (const item of items) {
      if (!item) continue;
      if (item.type !== selectedMetric) continue;

      const d = toDate(item.createdAt);
      if (!d) continue;
      if (d < s || d > e) continue;

      const q = getQuarterFromDate(d);
      base[q].count += 1;
      base.total += 1;
    }

    base.periodDays = periodDays;
    ["1분기", "2분기", "3분기", "4분기"].forEach((q) => {
      base[q].avgPerDay =
        base[q].count === 0
          ? 0
          : Number((base[q].count / periodDays).toFixed(2));
    });

    return base;
  }, [items, selectedMetric, localStart, localEnd]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex items-start mt-6">

      {/* ===== 날짜 필터 ===== */}
      <div className="w-[150px] h-[440px] flex flex-col items-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            w-[140px] h-[50px]
            flex items-center justify-center gap-2
            rounded-[20px] shadow-md
            hover:shadow-lg hover:bg-gray-50
            transition cursor-pointer
            mr-5
          "
        >
          <span className="text-[25px] font-medium">날짜</span>
          <img src={CalendarIcon} className="w-[25px] h-[25px]" />
        </button>

        {open && (
          <div className="
               mt-5 bg-white shadow-lg rounded-xl 
               p-2 z-50 mr-20 relative">
            <DatePicker
          inline
          selectsRange
          locale={ko}
          startDate={localStart}
          endDate={localEnd}
          dateFormat="yyyy.MM.dd"
          calendarStartDay={1}
          onChange={(dates) => {
            const [s, e] = dates;
            setLocalStart(s);
            setLocalEnd(e);
            if (s && e) setOpen(false);
          }}
          dayClassName={(date) => {
            const s = localStart && new Date(localStart);
            const e = localEnd && new Date(localEnd);

            const isStart =
              s && date.toDateString() === s.toDateString();
            const isEnd =
              e && date.toDateString() === e.toDateString();
            const isInRange =
              s && e && date > s && date < e;

            const isToday =
              date.toDateString() === new Date().toDateString();

            if (isStart || isEnd) {
              return `
                bg-[#054E76] text-white
                rounded-full
                hover:bg-[#054E76]
              `;
            }

            if (isInRange) {
              return `
                bg-[#E6EEF2] text-[#054E76]
                rounded-none
                hover:bg-[#E6EEF2]
              `;
            }

            if (isToday) {
              return `
                border border-[#054E76]
                rounded-full
              `;
            }

            return `
              hover:bg-gray-100
              rounded-full
            `;
          }}
        />

          </div>
        )}
      </div>

      {/* ===== 분기별 데이터 카드 ===== */}
      <div
        className="
          w-[350px] h-[440px]
          bg-white border rounded-xl
          p-6 text-center ml-3
        "
      >
        {/* 제목 */}
        <div className="text-[18px] font-bold mb-2 mt-4">
          분기별 발생 수 ({selectedMetric})
        </div>

        {/* 기간 */}
        <div className="text-[13px] text-gray-500 mb-4">
          기간: {toDate(localStart)?.toLocaleDateString("ko-KR")} ~{" "}
          {toDate(localEnd)?.toLocaleDateString("ko-KR")}
        </div>

        {/* 테이블 */}
        <table className="w-full text-[14px] border-collapse">
          <thead>
            <tr className="bg-[#054E76] text-white h-[40px]">
              <th className="px-5 text-center font-medium rounded-l-md">
                분기
              </th>
              <th className="px-4 text-right font-medium">
                발생 수
              </th>
              <th className="px-6 text-right font-medium rounded-r-md">
                평균(일)
              </th>
            </tr>
          </thead>

          <tbody className="border-b border-gray-300">
            {["1분기", "2분기", "3분기", "4분기"].map((q) => (
              <tr key={q} className="border-b border-gray-200">
                <td className="px-5 py-3 text-center">{q}</td>
                <td className="px-6 py-3 text-right">
                  {stats[q].count}건
                </td>
                <td className="px-6 py-3 text-right">
                  {stats[q].avgPerDay}건
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 하단 요약 */}
        <div className="mt-4 text-[15px] leading-8">
          <div>
            전체 발생 수:{" "}
            <span className="font-bold text-[#0888D4] text-[22px]">
              {stats.total}건
            </span>
          </div>

          <div>
            전체 평균 발생 수(일):{" "}
            <span className="font-bold text-[#0888D4] text-[22px]">
              {stats.periodDays > 0
                ? Number((stats.total / stats.periodDays).toFixed(2))
                : 0}
              건
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
