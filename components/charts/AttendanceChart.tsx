import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface AttendanceChartProps {
  labels: string[];
  values: number[];
}

export function AttendanceChart({ labels, values }: AttendanceChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "حاضری فیصد",
        data: values,
        borderColor: "#059669",
        backgroundColor: "rgba(5,150,105,0.15)",
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="rounded-2xl bg-surface shadow-sm border border-borderSoft/70 p-4 animate-fade-up">
      <h3 className="mb-2 text-sm font-semibold text-gray-800">
        حاضری کا رجحان
      </h3>
      <Line data={data} options={options} />
    </div>
  );
}
