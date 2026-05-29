"use client";
interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  accent?: boolean;
}

export function MetricCard({ label, value, sub, positive, negative, accent }: MetricCardProps) {
  const valueColor = positive ? "#00e5a0" : negative ? "#ff4d6d" : accent ? "#00e5a0" : "#f0f2f5";
  return (
    <div style={{
      background: "#111417",
      border: "1px solid #1e2329",
      borderRadius: "12px",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.25rem",
    }}>
      <span className="metric-label" style={{
        color: "#7c8794",
        fontSize: "0.7rem",
        fontFamily: "var(--font-syne)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        {label}
      </span>
      <span className="metric-value" style={{
        color: valueColor,
        fontSize: "1.5rem",
        fontFamily: "var(--font-dm-mono)",
        fontWeight: 500,
        lineHeight: 1.1,
        wordBreak: "break-all",
      }}>
        {value}
      </span>
      {sub && (
        <span style={{
          color: positive ? "#00b87f" : negative ? "#cc3d56" : "#7c8794",
          fontSize: "0.7rem",
          fontFamily: "var(--font-dm-mono)",
        }}>
          {sub}
        </span>
      )}
    </div>
  );
}
