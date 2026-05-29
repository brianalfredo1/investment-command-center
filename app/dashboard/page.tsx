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
    { id: "portfolio", label: "Portfolio" },
    { id: "ai-import", label: "AI Import" },
    { id: "ai-suggestions", label: "AI Suggestions" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c0f", color: "#f0f2f5", padding: "0 0 3rem" }}>
      <style>{`@keyframes pulse { 0%,100% { opacity:.5 } 50% { opacity:1 } }`}</style>

      {/* Header */}
      <header style={{
        background: "#0a0c0f",
        borderBottom: "1px solid #1e2329",
        padding: "0 2rem",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ color: "#00e5a0", fontSize: "1.125rem", fontWeight: 800 }}>◈</span>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em", color: "#f0f2f5" }}>
              Investment Command Center
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {error && <span style={{ color: "#ff4d6d", fontSize: "0.75rem", fontFamily: "var(--font-dm-mono)" }}>⚠ {error}</span>}
            <button onClick={refetch} style={{ background: "none", border: "1px solid #1e2329", borderRadius: "6px", color: "#7c8794", cursor: "pointer", padding: "5px 12px", fontSize: "0.75rem", fontFamily: "var(--font-syne)" }}>
              ↺ Refresh
            </button>
            <button onClick={() => setShowAdd(true)} style={{
              background: "#00e5a0", border: "none", borderRadius: "8px",
              color: "#0a0c0f", padding: "0.45rem 1.1rem", cursor: "pointer",
              fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.8rem",
              display: "flex", alignItems: "center", gap: "0.3rem",
            }}>
              + Add Position
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.75rem 2rem 0" }}>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #1e2329", marginBottom: "1.75rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0.625rem 1.25rem",
              fontFamily: "var(--font-syne)", fontWeight: 600, fontSize: "0.85rem",
              color: tab === t.id ? "#00e5a0" : "#7c8794",
              borderBottom: `2px solid ${tab === t.id ? "#00e5a0" : "transparent"}`,
              marginBottom: "-1px",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── PORTFOLIO TAB ── */}
        {tab === "portfolio" && (
          <>
            {/* Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ height: "90px", background: "#111417", borderRadius: "12px", border: "1px solid #1e2329", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))
              ) : (
                <>
                  <MetricCard label="Total Invested" value={fmt(metrics.total_invested)} accent />
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
                    label="Profitable Positions"
                    value={`${metrics.profitable_count} / ${metrics.total_positions}`}
                    sub={metrics.total_positions > 0 ? `${((metrics.profitable_count / metrics.total_positions) * 100).toFixed(0)}% win rate` : undefined}
                    positive={metrics.profitable_count > 0}
                  />
                </>
              )}
            </div>

            {/* Charts */}
            {!loading && positions.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.8rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1rem" }}>ROI by Position</h3>
                  <div style={{ height: "220px" }}>
                    <ROIBarChart positions={positions} />
                  </div>
                </div>
                <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.8rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 1rem" }}>Allocation by Category</h3>
                  <div style={{ height: "220px" }}>
                    <AllocationDonut positions={positions} />
                  </div>
                </div>
              </div>
            )}

            {/* Positions Table */}
            <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #1e2329", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.8rem", color: "#7c8794", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                  All Positions ({positions.length})
                </h3>
              </div>
              {loading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "#7c8794", fontFamily: "var(--font-dm-mono)", fontSize: "0.85rem" }}>
                  Loading positions…
                </div>
              ) : (
                <PositionTable
                  positions={positions}
                  onEdit={setEditTarget}
                  onDelete={deletePosition}
                />
              )}
            </div>
          </>
        )}

        {/* ── AI IMPORT TAB ── */}
        {tab === "ai-import" && (
          <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.1rem", color: "#f0f2f5", margin: "0 0 0.375rem" }}>
                AI Screenshot Import
              </h2>
              <p style={{ color: "#7c8794", fontSize: "0.8rem", fontFamily: "var(--font-dm-mono)", margin: 0 }}>
                Upload a screenshot from any investment app. Claude will extract all positions automatically.
              </p>
            </div>
            <ScreenshotImport onImport={handleImport} />
          </div>
        )}

        {/* ── AI SUGGESTIONS TAB ── */}
        {tab === "ai-suggestions" && (
          <div style={{ background: "#111417", border: "1px solid #1e2329", borderRadius: "12px", padding: "1.75rem" }}>
            <AISuggestions positions={positions} />
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Position" onClose={() => setShowAdd(false)}>
          <PositionForm
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title={`Edit — ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <PositionForm
            initial={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}
    </div>
  );
}
