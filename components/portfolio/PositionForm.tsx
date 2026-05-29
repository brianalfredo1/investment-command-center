"use client";
import { useState } from "react";
import type { Position, PositionCategory, PositionStatus } from "@/types";

const CATEGORIES: PositionCategory[] = ["Crypto","Stocks","ETF","Trading","Business","Real Estate","Bonds","Other"];
const STATUSES: PositionStatus[] = ["Active","Closed","Pending"];

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#171b21", border: "1px solid #1e2329",
  borderRadius: "8px", color: "#f0f2f5", padding: "0.5rem 0.75rem",
  fontFamily: "var(--font-dm-mono)", fontSize: "0.875rem", outline: "none",
};
const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: "0.375rem",
  color: "#7c8794", fontSize: "0.75rem", fontFamily: "var(--font-syne)",
  textTransform: "uppercase", letterSpacing: "0.06em",
};

interface Props {
  initial?: Partial<Position>;
  onSubmit: (data: Omit<Position, "id" | "created_at" | "updated_at">) => Promise<void>;
  onCancel: () => void;
}

export function PositionForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState({
    user_id: initial?.user_id || "demo",
    name: initial?.name || "",
    subtitle: initial?.subtitle || "",
    category: initial?.category || "Crypto" as PositionCategory,
    cost_basis: initial?.cost_basis?.toString() || "",
    current_value: initial?.current_value?.toString() || "",
    entry_date: initial?.entry_date || new Date().toISOString().slice(0, 10),
    status: initial?.status || "Active" as PositionStatus,
    platform: initial?.platform || "",
    notes: initial?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Asset name is required"); return; }
    setSaving(true); setErr("");
    try {
      await onSubmit({
        ...form,
        cost_basis: parseFloat(form.cost_basis) || 0,
        current_value: parseFloat(form.current_value) || 0,
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key as keyof typeof form]}
        onChange={e => set(key, e.target.value)}
        style={inputStyle}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        {field("Ticker / Name", "name", "text", "BTC")}
        {field("Full Name", "subtitle", "text", "Bitcoin")}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {field("Cost Basis (USD)", "cost_basis", "number", "0.00")}
        {field("Current Value (USD)", "current_value", "number", "0.00")}
        {field("Entry Date", "entry_date", "date")}
        {field("Platform / Source", "platform", "text", "Binance")}
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>
      {err && <p style={{ color: "#ff4d6d", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{err}</p>}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{
          background: "none", border: "1px solid #1e2329", borderRadius: "8px",
          color: "#7c8794", padding: "0.5rem 1.25rem", cursor: "pointer",
          fontFamily: "var(--font-syne)", fontSize: "0.875rem",
        }}>Cancel</button>
        <button type="submit" disabled={saving} style={{
          background: "#00e5a0", border: "none", borderRadius: "8px",
          color: "#0a0c0f", padding: "0.5rem 1.25rem", cursor: "pointer",
          fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem",
          opacity: saving ? 0.6 : 1,
        }}>{saving ? "Saving…" : "Save Position"}</button>
      </div>
    </form>
  );
}
