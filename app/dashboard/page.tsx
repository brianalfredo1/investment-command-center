"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePortfolio } from "@/hooks/usePortfolio";
import { MetricCard } from "@/components/ui/MetricCard";
import { Modal } from "@/components/ui/Modal";
import { PositionForm } from "@/components/portfolio/PositionForm";
import { PositionTable } from "@/components/portfolio/PositionTable";
import { ScreenshotImport } from "@/components/ai/ScreenshotImport";
import { AISuggestions } from "@/components/ai/AISuggestions";
import type { Position } from "@/types";

const ROIBarChart = dynamic(
  () => import("@/components/charts/ROIBarChart").then(m => m.ROIBarChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const AllocationDonut = dynamic(
  () => import("@/components/charts/AllocationDonut").then(m => m.AllocationDonut),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return <div style={{ height: "100%", background: "#171b21", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

type Tab = "portfolio" | "ai-import" | "ai-suggestions";

export default function Dashboard() {
  const { positions, metrics, loading, error, addPosition, updatePosition, deletePosition, refetch } = usePortfolio("demo");
  const [tab, setTab] = useState<Tab>("portfolio");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Position | null>(null);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  const handleAdd = useCallback(async (data: Omit<Position, "id" | "created_at" | "updated_at">) => {
    await addPosition(data);
    setShowAdd(false);
  }, [addPosition]);

  const handleEdit = useCallback(async (data: Omit<Position, "id" | "created_at" | "updated_at">) => {
    if (!editTarget) return;
    await updatePosition(editTarget.id, data);
    setEditTarget(null);
  }, [editTarget, updatePosition]);

  const handleImport = useCallback(async (positions: Omit<Position, "id" | "created_at" | "updated_at">[]) => {
    await Promise.all(positions.map(p => addPosition(p)));
    setTab("portfolio");
  }, [addPosition]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "portfolio",      label: "Portfolio" },
    { id: "ai-import",      label: "AI Import" },
    { id: "ai-suggestions", label: "AI Suggestions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c0f", color: "#f0f2f5" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      {/* ── Header ── */}
      <header style={{ background: "#0a0c0f", borderBottom: "1px solid #1e2329", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="app-header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <span style={{ color: "#00e5a0", fontSize: "1.1rem", fontWeight: 800, flexShrink: 0 }}>◈</span>
            <span className="app-header-title">Investment Command Center</span>
          </div>
          <div className="app-header-actions">
            {error && <span style={{ color: "#ff4d6d", fontSize: "0.7rem", fontFamily: "var(--font-dm-mono)", display: "none" }} className="error-badge">⚠</span>}
            <button onClick={refetch} style={{
              background: "none", border: "1px solid #1e2329", borderRadius: "6px",
              color: "#7c8794", cursor: "pointer", padding: "5px 10px",
              fontSize: "0.7rem", fontFamily: "var(--font-syne)", whiteSpace: "nowrap",
            }}>↺ Refresh</button>
            <button onClick={() => setShowAdd(true)} style={{
              background: "#00e5a0", border: "none", borderRadius: "8px",
              color: "#0a0c0f", padding: "0.45rem 1rem", cursor: "pointer",
              fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.8rem",
              whiteSpace: "nowrap",
            }}>+ Add</button>
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* ── Tab Nav ── */}
        <div className="tab-nav">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0.625rem 1.1rem",
              fontFamily: "var(--font-syne)", fontWeight: 600, fontSize: "0.85rem",
              color: tab === t.id ? "#00e5a0" : "#7c8794",
              borderBottom: `2px solid ${tab === t.id ? "#00e5a0" : "transparent"}`,
              marginBottom: "-1px", transition: "all 0.15s",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            PORTFOLIO TAB
        ══════════════════════════════════════ */}
        {tab === "portfolio" && (
          <>
            {/* Metric Cards */}
            <div className="metrics-grid">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ height: "88px", background: "#111417", borderRadius: "12px", border: "1px solid #1e2329", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))
              ) : (
                <>
                  <MetricCard label="Total Invested"    value={fmt(metrics.total_invested)} accent />
                  <MetricCard
                    label="Current Value"
                    value={fmt(metrics.current_value)}
                    sub={`${metrics.current_value >= metrics.total_invested ? "▲" : "▼"} ${fmt(Math.abs(metrics.current_value - metrics.total_invested))}`}
                    positive={metrics.current_value >= metrics.total_invested}
                    negative={metrics.current_value < metrics.total_invested}
                  />
                  <MetricCard
                    label="Overall ROI"
                    value={fmtPct(metrics.overall_roi)}
                    positive={metrics.overall_roi >= 0}
                    negative={metrics.overall_roi < 0}
                  />
                  <MetricCard
                    label="Profitable"
                    value={`${metrics.profitable_count} / ${metrics.total_positions}`}
                    sub={metrics.total_positions > 0 ? `${((metrics.profitable_count / metrics.total_positions) * 100).toFixed(0)}% win rate` : undefined}
                    positive={metrics.profitable_count > 0}
                  />
                </>
              )}
            </div>

            {/* Charts */}
            {!loading && positions.length > 0 && (
              <div className="charts-grid">
                <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.25rem 1.25rem 1rem" }}>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.75rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.875rem" }}>ROI by Position</h3>
                  <div style={{ height: "220px" }}>
                    <ROIBarChart positions={positions} />
                  </div>
                </div>
                <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.25rem 1.25rem 1rem" }}>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.75rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.875rem" }}>Allocation by Category</h3>
                  <div style={{ height: "220px" }}>
                    <AllocationDonut positions={positions} />
                  </div>
                </div>
              </div>
            )}

            {/* Positions Table */}
            <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ padding: "0.875rem 1.1rem", borderBottom: "1px solid #1e2329", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.75rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  All Positions ({positions.length})
                </h3>
              </div>
              {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#7c8794", fontFamily: "var(--font-dm-mono)", fontSize: "0.85rem" }}>
                  Loading positions…
                </div>
              ) : (
                <div className="positions-table-wrap">
                  <PositionTable
                    positions={positions}
                    onEdit={setEditTarget}
                    onDelete={deletePosition}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════
            AI IMPORT TAB
        ══════════════════════════════════════ */}
        {tab === "ai-import" && (
          <div className="ai-panel" style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1rem", color: "#f0f2f5", margin: "0 0 0.375rem" }}>
                AI Screenshot Import
              </h2>
              <p style={{ color: "#7c8794", fontSize: "0.8rem", fontFamily: "var(--font-dm-mono)", margin: 0 }}>
                Upload a screenshot from any investment app. Gemini will extract all positions automatically.
              </p>
            </div>
            <ScreenshotImport onImport={handleImport} />
          </div>
        )}

        {/* ══════════════════════════════════════
            AI SUGGESTIONS TAB
        ══════════════════════════════════════ */}
        {tab === "ai-suggestions" && (
          <div className="ai-panel" style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.75rem" }}>
            <AISuggestions positions={positions} />
          </div>
        )}

      </main>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Position" onClose={() => setShowAdd(false)}>
          <PositionForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title={`Edit — ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <PositionForm initial={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  );
}
