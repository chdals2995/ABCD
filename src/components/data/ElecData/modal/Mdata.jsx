// src/pages/data/ElecData/Mdata.jsx (예시)
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
import { ElecMdata } from "../../../../hooks/dataPage/ElecMdata";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ModalMdata() {
  const { monthData, labels, loading } = ElecMdata();

  if (loading) return <p className="text-xs text-gray-500">로딩중...</p>;
  if (!monthData.length) return <p className="text-xs text-gray-500">데이터가 없습니다.</p>;

  const values = monthData.map((m) => Math.floor(m.elecSum)); // 월별 전력 합계

  const barColors = values.map((v) => {
    if (v > 90000) {
      return "#414141";           // 위험
    } else if (v >= 80000 && v <= 90000) {
      return "#E54138";           // 주의
    } else {
      return "#F3D21B";           // 정상
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: "월별 전력 사용량 (kWh)",
        data: values,
        backgroundColor: "#2563EB",
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        min:0,
        max:110000,
        title: {
          display: true,
          text: "단위(kWh)",
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
}
