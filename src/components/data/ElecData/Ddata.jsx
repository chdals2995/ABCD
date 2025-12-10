// src/pages/data/Ddata.jsx

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ElecDdata } from "../../../hooks/dataPage/EelecDdata";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Ddata() {
  const { dailyData, labels, loading } = ElecDdata();

  if (loading) {
    return <p className="text-xs text-gray-500">로딩중...</p>;
  }
  if (!dailyData.length) {
    return <p className="text-xs text-gray-500">데이터가 없습니다.</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "일별 전력 사용량 (kWh)",
        data: dailyData.map((d) => d.elecSum),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "최근 7일 전력 사용량" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="flex w-4/5 h-2/3 flex-col ml-[50%] translate-x-[-50%]">
      <div className="flex-1 min-h-0">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
