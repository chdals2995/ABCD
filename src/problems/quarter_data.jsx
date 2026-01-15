// src/problems/quarter_data.jsx
import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CalendarIcon from "../assets/icons/calendar_icon.png";
import { ko } from "date-fns/locale";

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

export default function QuarterData({
  items = [],
  selectedMetric = "전력",
  startDate,
  endDate,
}) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

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

  return (
    <div className="flex items-start py-[20px] mt-[-20px]">
      {/* 날짜 */}
      <div className="w-[130px] flex flex-col items-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            w-[120px] h-[44px]
            flex items-center justify-center gap-2
            rounded-[16px] shadow-sm
            hover:shadow hover:bg-gray-50
            transition cursor-pointer
          "
        >
          <span className="text-[18px] font-medium">날짜</span>
          <img src={CalendarIcon} className="w-[18px] h-[18px]" />
        </button>

        {open && (
          <div className="mt-3 bg-white shadow-lg rounded-xl p-2 z-50 relative">
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

                const isStart = s && date.toDateString() === s.toDateString();
                const isEnd = e && date.toDateString() === e.toDateString();
                const isInRange = s && e && date > s && date < e;
                const isToday =
                  date.toDateString() === new Date().toDateString();

                if (isStart || isEnd) {
                  return `bg-[#054E76] text-white rounded-full hover:bg-[#054E76]`;
                }
                if (isInRange) {
                  return `bg-[#E6EEF2] text-[#054E76] rounded-none hover:bg-[#E6EEF2]`;
                }
                if (isToday) {
                  return `border border-[#054E76] rounded-full`;
                }
                return `hover:bg-gray-100 rounded-full`;
              }}
            />
          </div>
        )}
      </div>

      {/* 카드 */}
      <div className="w-[360px] bg-white border rounded-xl p-4 text-center ml-3">
        <div className="text-[20px] font-bold mb-1">
          분기별 발생 수 ({selectedMetric})
        </div>

        <div className="text-[15px] text-gray-500 mb-3">
          기간: {toDate(localStart)?.toLocaleDateString("ko-KR")} ~{" "}
          {toDate(localEnd)?.toLocaleDateString("ko-KR")}
        </div>

        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-[#054E76] text-white h-[34px]">
              <th className="px-3 text-center font-medium rounded-l-md text-[15px]">
                분기
              </th>
              <th className="px-3 text-right font-medium text-[15px]">발생 수</th>
              <th className="px-3 text-right font-medium rounded-r-md text-[15px]">
                평균(일)
              </th>
            </tr>
          </thead>

          <tbody className="border-b border-gray-200">
            {["1분기", "2분기", "3분기", "4분기"].map((q) => (
              <tr key={q} className="border-b border-gray-100">
                <td className="px-3 py-2 text-center text-[15px]">{q}</td>
                <td className="px-3 py-2 text-right text-[15px]">{stats[q].count}건</td>
                <td className="px-3 py-2 text-right text-[15px]">{stats[q].avgPerDay}건</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 text-[13px] leading-7">
          <div className="text-[15px]">
            전체 발생 수:{" "}
            <span className="font-bold text-[#0888D4] text-[18px]">
              {stats.total}건
            </span>
          </div>

          <div className="text-[15px]">
            전체 평균(일):{" "}
            <span className="font-bold text-[#0888D4] text-[18px]">
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
