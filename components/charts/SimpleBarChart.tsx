import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SimpleBarChartProps {
  title: string;
  labels: string[];
  values: number[];
  datasetLabel?: string;
}

export function SimpleBarChart({
  title,
  labels,
  values,
  datasetLabel = "اعداد",
}: SimpleBarChartProps) {
  const backgroundPalette = [
    "rgba(16,185,129,0.9)",
    "rgba(59,130,246,0.9)",
    "rgba(234,88,12,0.9)",
    "rgba(139,92,246,0.9)",
    "rgba(236,72,153,0.9)",
    "rgba(250,204,21,0.9)",
  ];
  const borderPalette = [
    "rgba(5,150,105,1)",
    "rgba(37,99,235,1)",
    "rgba(194,65,12,1)",
    "rgba(109,40,217,1)",
    "rgba(190,24,93,1)",
    "rgba(217,119,6,1)",
  ];

  const backgroundColor =
    labels.length > 1
      ? labels.map(
          (_, idx) => backgroundPalette[idx % backgroundPalette.length]
        )
      : backgroundPalette[0];

  const borderColor =
    labels.length > 1
      ? labels.map((_, idx) => borderPalette[idx % borderPalette.length])
      : borderPalette[0];

  const data = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: 0,
        borderRadius: 10,
        maxBarThickness: 56,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#020617",
        titleColor: "#e5e7eb",
        bodyColor: "#e5e7eb",
        padding: 10,
        borderColor: "rgba(148,163,184,0.6)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: { display: false },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148,163,184,0.18)",
        },
        border: { display: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 10 },
          callback: (value) => {
            if (typeof value === "number") {
              return value.toLocaleString();
            }
            return value as string;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl bg-surface shadow-sm border border-borderSoft/70 p-4">
      <h3 className="mb-2 text-sm font-semibold text-gray-800 text-right">
        {title}
      </h3>
      <div className="mt-1 h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
