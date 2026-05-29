"use client";
import { useState } from "react";
import type { Position } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Crypto: "#00e5a0", Stocks: "#3b82f6", ETF: "#a855f7",
  Trading: "#f5a623", Business: "#06b6d4", "Real Estate": "#10b981",
  Bonds: "#6366f1", Other: "#7c8794",
};

interface Props {
  positions: Position[];
  onEdit: (p: Position) => void;
  onDelete: (id: string) => void;
}

export function PositionTable({ positions, onEdit, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const sorted = [...positions].sort((a, b) => {
    const roiA = Number(a.cost_basis) > 0
      ? ((Number(a.current_value) - Number(a.cost_basis)) / Number(a.cost_basis)) * 100 : 0;
    const roiB = Number(b.cost_basis) > 0
      ? ((Number(b.current_value) - Number(b.cost_basis)) / Number(b.cost_basis)) * 100 : 0;
    return roiB - roiA;
  });

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
  const roi = (p: Position) => Number(p.cost_basis) > 0
    ? ((Number(p.current_value) - Number(p.cost_basis)) / Number(p.cost_basis)) * 100 : null;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this position?")) return;
    setDeleting(id);
    try { await onDelete(id); } finally { setDeleting(null); }
  };

  const thStyle: React.CSSProperties = {
    padding: "0.625rem 0.875rem", textAlign: "left",
    color: "#7c8794", fontSize: "0.7rem", fontFamily: "var(--font-syne)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    borderBottom: "1px solid #1e2329", whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    padding: "0.75rem 0.875rem", borderBottom: "1px solid #1e2329",
    fontFamily: "var(--font-dm-mono)", fontSize: "0.8125rem",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Asset</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Platform</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Cost Basis</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Current</th>
            <th style={{ ...thStyle, textAlign: "right" }}>ROI%</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Gain/Loss</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            const r = roi(p);
            const gl = Number(p.current_value) - Number(p.cost_basis);
            const isPos = gl >= 0;
            return (
              <tr key={p.id} style={{ transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#171b21")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ color: "#f0f2f5", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: "#7c8794", fontSize: "0.7rem" }}>{p.subtitle}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                    background: (CATEGORY_COLORS[p.category] || "#7c8794") + "22",
                    color: CATEGORY_COLORS[p.category] || "#7c8794",
                    fontSize: "0.7rem", fontFamily: "var(--font-syne)",
                  }}>{p.category}</span>
                </td>
                <td style={{ ...tdStyle, color: "#7c8794" }}>{p.platform}</td>
                <td style={{ ...tdStyle, textAlign: "right", color: "#7c8794" }}>{fmt(Number(p.cost_basis))}</td>
                <td style={{ ...tdStyle, textAlign: "right", color: "#f0f2f5" }}>{fmt(Number(p.current_value))}</td>
                <td style={{ ...tdStyle, textAlign: "right", color: r === null ? "#7c8794" : r >= 0 ? "#00e5a0" : "#ff4d6d" }}>
                  {r !== null ? `${r >= 0 ? "+" : ""}${r.toFixed(2)}%` : "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                    background: isPos ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)",
                    color: isPos ? "#00e5a0" : "#ff4d6d", fontSize: "0.75rem",
                  }}>
                    {isPos ? "+" : ""}{fmt(gl)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                    background: p.status === "Active" ? "rgba(0,229,160,0.1)" :
                      p.status === "Closed" ? "rgba(124,135,148,0.12)" : "rgba(245,166,35,0.12)",
                    color: p.status === "Active" ? "#00e5a0" :
                      p.status === "Closed" ? "#7c8794" : "#f5a623",
                    fontSize: "0.7rem", fontFamily: "var(--font-syne)",
                  }}>{p.status}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <button onClick={() => onEdit(p)} style={{
                      background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "6px", color: "#3b82f6", cursor: "pointer",
                      padding: "3px 10px", fontSize: "0.7rem", fontFamily: "var(--font-syne)",
                    }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{
                      background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.25)",
                      borderRadius: "6px", color: "#ff4d6d", cursor: "pointer",
                      padding: "3px 10px", fontSize: "0.7rem", fontFamily: "var(--font-syne)",
                      opacity: deleting === p.id ? 0.5 : 1,
                    }}>{deleting === p.id ? "…" : "Del"}</button>
                  </div>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: "#7c8794", padding: "2.5rem" }}>
                No positions yet — add one or use AI Import
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
