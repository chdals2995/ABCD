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
import { ElecDdata } from "../../../../hooks/dataPage/elec/ElecDdata";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ModalDdata() {
  const { dailyData, labels, loading } = ElecDdata();

  if (loading) {
    return <p className="text-xs text-gray-500">로딩중...</p>;
  }
  if (!dailyData.length) {
    return <p className="text-xs text-gray-500">데이터가 없습니다.</p>;
  }

  // 막대 값 + 색상
  const values = dailyData.map((d) => {
    const v = Number(d.elecSum);
    if (Number.isNaN(v)) return 0;
    return Math.floor(v);
  });

  const barColors = values.map((v) => {
    if (v > 3500) {
      return "#414141";           // 위험
    } else if (v >= 2000 && v <= 3500) {
      return "#E54138";           // 주의
    } else {
      return "#F3D21B";           // 정상
    }
  });

  const data = {
    labels,
    datasets: [
      {
        label: "일별 전력 사용량 (kWh)",
        data: values,
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
      legend: { display: false },     // 범례는 우리가 따로 만듦
      title: { display: false },      // 제목도 바깥에 넣을 거라 끔
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        min:0,
        max:4000,
        beginAtZero: true,
        title: {
          display: true,
          text: "단위(kWh)",
          align:"end",
          padding: {top:0, bottom:10}
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
