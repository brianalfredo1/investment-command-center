"use client";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { Position } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS: Record<string, string> = {
  Crypto:       "#00e5a0",
  Stocks:       "#3b82f6",
  ETF:          "#a855f7",
  Trading:      "#f5a623",
  Business:     "#06b6d4",
  "Real Estate":"#10b981",
  Bonds:        "#6366f1",
  Other:        "#7c8794",
};

interface Props { positions: Position[] }

export function AllocationDonut({ positions }: Props) {
  const byCategory: Record<string, number> = {};
  positions.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + Number(p.current_value);
  });

  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  const colors = labels.map(l => CATEGORY_COLORS[l] || "#7c8794");

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.map(c => c + "cc"),
      borderColor: colors,
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#7c8794",
          font: { family: "var(--font-syne)", size: 12 },
          boxWidth: 10,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number; dataset: { data: number[] } }) => {
            const total = ctx.dataset.data.reduce((s: number, v: number) => s + v, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ${ctx.label}: $${ctx.parsed.toFixed(2)} (${pct}%)`;
          },
        },
        backgroundColor: "#171b21",
        borderColor: "#1e2329",
        borderWidth: 1,
        titleColor: "#f0f2f5",
        bodyColor: "#7c8794",
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
