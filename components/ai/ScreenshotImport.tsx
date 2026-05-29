"use client";
import { useState, useRef } from "react";
import type { ExtractedPosition, Position } from "@/types";

interface Props { onImport: (positions: Omit<Position, "id" | "created_at" | "updated_at">[]) => Promise<void> }

export function ScreenshotImport({ onImport }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedPosition[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file"); return; }
    setLoading(true); setError(""); setExtracted([]);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setPreview(result);
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/screenshot-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error(data.error || "Invalid response");
      setExtracted(data);
      setSelected(new Set(data.map((_: unknown, i: number) => i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract positions");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  };

  const handleImport = async () => {
    const toImport = extracted.filter((_, i) => selected.has(i));
    setImporting(true);
    try {
      await onImport(toImport.map(p => ({
        user_id: "demo",
        name: p.name,
        subtitle: p.sub,
        category: p.category,
        cost_basis: p.initial,
        current_value: p.current,
        entry_date: new Date().toISOString().slice(0, 10),
        status: p.status || "Active",
        platform: p.source,
      })));
      setExtracted([]); setSelected(new Set()); setPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const fmt = (n: number) => `$${Number(n).toFixed(2)}`;
  const roi = (init: number, curr: number) => init > 0 ? ((curr - init) / init * 100).toFixed(1) + "%" : "N/A";

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#00e5a0" : "#1e2329"}`,
          borderRadius: "12px", padding: "2.5rem", textAlign: "center",
          cursor: "pointer", transition: "all 0.2s",
          background: dragging ? "rgba(0,229,160,0.04)" : "#111417",
        }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📸</div>
        {loading ? (
          <p style={{ color: "#00e5a0", fontFamily: "var(--font-syne)" }}>Analyzing screenshot with Claude AI…</p>
        ) : (
          <>
            <p style={{ color: "#f0f2f5", fontFamily: "var(--font-syne)", fontWeight: 600, marginBottom: "0.25rem" }}>
              Drop a screenshot here or click to browse
            </p>
            <p style={{ color: "#7c8794", fontSize: "0.8rem", fontFamily: "var(--font-dm-mono)" }}>
              Supports any investment app screenshot (Binance, Stockbit, Robinhood, etc.)
            </p>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "8px", color: "#ff4d6d", fontSize: "0.85rem", fontFamily: "var(--font-dm-mono)" }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && !extracted.length && !loading && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <img src={preview} alt="Preview" style={{ maxHeight: "200px", borderRadius: "8px", border: "1px solid #1e2329" }} />
        </div>
      )}

      {/* Extracted positions */}
      {extracted.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h3 style={{ color: "#f0f2f5", fontFamily: "var(--font-syne)", fontWeight: 700, margin: 0 }}>
              {extracted.length} positions extracted
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setSelected(new Set(extracted.map((_, i) => i)))}
                style={{ background: "none", border: "1px solid #1e2329", borderRadius: "6px", color: "#7c8794", cursor: "pointer", padding: "4px 10px", fontSize: "0.75rem", fontFamily: "var(--font-syne)" }}>
                All
              </button>
              <button onClick={() => setSelected(new Set())}
                style={{ background: "none", border: "1px solid #1e2329", borderRadius: "6px", color: "#7c8794", cursor: "pointer", padding: "4px 10px", fontSize: "0.75rem", fontFamily: "var(--font-syne)" }}>
                None
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {extracted.map((p, i) => {
              const isPos = p.current >= p.initial;
              return (
                <div key={i} onClick={() => toggleSelect(i)} style={{
                  display: "flex", alignItems: "center", gap: "0.875rem",
                  padding: "0.75rem 1rem", borderRadius: "8px",
                  background: selected.has(i) ? "rgba(0,229,160,0.06)" : "#111417",
                  border: `1px solid ${selected.has(i) ? "rgba(0,229,160,0.3)" : "#1e2329"}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => {}}
                    style={{ accentColor: "#00e5a0", width: 14, height: 14 }} />
                  <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "0.5rem", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "#f0f2f5", fontFamily: "var(--font-dm-mono)", fontWeight: 500 }}>{p.name}</div>
                      <div style={{ color: "#7c8794", fontSize: "0.7rem", fontFamily: "var(--font-dm-mono)" }}>{p.sub}</div>
                    </div>
                    <span style={{ color: "#7c8794", fontSize: "0.75rem", fontFamily: "var(--font-syne)" }}>{p.category}</span>
                    <span style={{ color: "#7c8794", fontSize: "0.75rem", fontFamily: "var(--font-dm-mono)" }}>{p.source}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#7c8794", fontSize: "0.7rem", fontFamily: "var(--font-dm-mono)" }}>{fmt(p.initial)}</div>
                      <div style={{ color: "#f0f2f5", fontSize: "0.8rem", fontFamily: "var(--font-dm-mono)" }}>{fmt(p.current)}</div>
                    </div>
                    <span style={{ textAlign: "right", color: isPos ? "#00e5a0" : "#ff4d6d", fontFamily: "var(--font-dm-mono)", fontSize: "0.8rem" }}>
                      {roi(p.initial, p.current)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleImport} disabled={selected.size === 0 || importing} style={{
              background: "#00e5a0", border: "none", borderRadius: "8px",
              color: "#0a0c0f", padding: "0.625rem 1.5rem", cursor: "pointer",
              fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem",
              opacity: (selected.size === 0 || importing) ? 0.5 : 1,
            }}>
              {importing ? "Importing…" : `Add ${selected.size} to Portfolio`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
