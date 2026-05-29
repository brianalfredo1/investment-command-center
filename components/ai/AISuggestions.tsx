"use client";
import { useState } from "react";
import type { Position } from "@/types";

interface Props { positions: Position[] }

export function AISuggestions({ positions }: Props) {
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!positions.length) { setError("No positions to analyze"); return; }
    setLoading(true); setError(""); setHtml(null);
    try {
      const res = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: positions }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHtml(data.html);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 style={{ color: "#f0f2f5", fontFamily: "var(--font-syne)", fontWeight: 700, margin: "0 0 0.25rem" }}>
            AI Portfolio Analysis
          </h3>
          <p style={{ color: "#7c8794", fontSize: "0.8rem", fontFamily: "var(--font-dm-mono)", margin: 0 }}>
            Claude analyzes your {positions.length} positions and returns allocation advice
          </p>
        </div>
        <button onClick={analyze} disabled={loading || positions.length === 0} style={{
          background: loading ? "#111417" : "linear-gradient(135deg, #00e5a0, #00b87f)",
          border: loading ? "1px solid #1e2329" : "none",
          borderRadius: "8px", color: loading ? "#7c8794" : "#0a0c0f",
          padding: "0.625rem 1.5rem", cursor: loading ? "wait" : "pointer",
          fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem",
          display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap",
        }}>
          {loading ? (
            <>
              <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #7c8794", borderTopColor: "#00e5a0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Analyzing…
            </>
          ) : "✦ Analyze My Portfolio"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ padding: "0.875rem 1rem", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)", borderRadius: "8px", color: "#ff4d6d", fontSize: "0.85rem", fontFamily: "var(--font-dm-mono)" }}>
          {error}
        </div>
      )}

      {html && (
        <div style={{
          background: "#111417", border: "1px solid #1e2329", borderRadius: "12px",
          padding: "1.5rem 1.75rem",
        }}>
          <style>{`
            .ai-output h3 { color: #f0f2f5; font-family: var(--font-syne); font-weight: 700; font-size: 0.95rem; margin: 1.25rem 0 0.5rem; border-left: 3px solid #00e5a0; padding-left: 0.75rem; }
            .ai-output h3:first-child { margin-top: 0; }
            .ai-output p { color: #b0b8c4; font-family: var(--font-dm-mono); font-size: 0.8rem; line-height: 1.7; margin: 0 0 0.5rem; }
            .ai-output ul { padding-left: 1.25rem; margin: 0.25rem 0 0.75rem; }
            .ai-output li { color: #b0b8c4; font-family: var(--font-dm-mono); font-size: 0.8rem; line-height: 1.7; margin-bottom: 0.25rem; }
            .ai-output strong { color: #f0f2f5; font-weight: 600; }
            .ai-output .green { color: #00e5a0; }
            .ai-output .red { color: #ff4d6d; }
          `}</style>
          <div className="ai-output" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}

      {!html && !loading && !error && (
        <div style={{
          textAlign: "center", padding: "3rem 1rem",
          border: "1px dashed #1e2329", borderRadius: "12px",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✦</div>
          <p style={{ color: "#7c8794", fontFamily: "var(--font-syne)", margin: 0 }}>
            Click "Analyze My Portfolio" to get AI-powered insights
          </p>
          <p style={{ color: "#4a5568", fontSize: "0.75rem", fontFamily: "var(--font-dm-mono)", marginTop: "0.375rem" }}>
            Requires ANTHROPIC_API_KEY in .env.local
          </p>
        </div>
      )}
    </div>
  );
}
