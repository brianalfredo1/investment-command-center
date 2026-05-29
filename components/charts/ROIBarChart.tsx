"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import type { Position } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props { positions: Position[] }

export function ROIBarChart({ positions }: Props) {
  const sorted = [...positions]
    .filter(p => Number(p.cost_basis) > 0)
    .sort((a, b) => {
      const roiA = ((Number(a.current_value) - Number(a.cost_basis)) / Number(a.cost_basis)) * 100;
      const roiB = ((Number(b.current_value) - Number(b.cost_basis)) / Number(b.cost_basis)) * 100;
      return roiB - roiA;
    });

  const labels = sorted.map(p => p.name);
  const rois = sorted.map(p =>
    Number(p.cost_basis) > 0
      ? ((Number(p.current_value) - Number(p.cost_basis)) / Number(p.cost_basis)) * 100
      : 0
  );

  const data = {
    labels,
    datasets: [{
      label: "ROI %",
      data: rois,
      backgroundColor: rois.map(r => r >= 0 ? "rgba(0,229,160,0.75)" : "rgba(255,77,109,0.75)"),
      borderColor: rois.map(r => r >= 0 ? "#00e5a0" : "#ff4d6d"),
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => ` ${(ctx.parsed.y ?? 0).toFixed(2)}%`,
        },
        backgroundColor: "#171b21",
        borderColor: "#1e2329",
        borderWidth: 1,
        titleColor: "#f0f2f5",
        bodyColor: "#7c8794",
      },
    },
    scales: {
      x: {
        ticks: { color: "#7c8794", font: { family: "var(--font-dm-mono)", size: 11 } },
        grid: { color: "#1e2329" },
      },
      y: {
        ticks: {
          color: "#7c8794",
          font: { family: "var(--font-dm-mono)", size: 11 },
          callback: (v: string | number) => `${Number(v).toFixed(0)}%`,
        },
        grid: { color: "#1e2329" },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
