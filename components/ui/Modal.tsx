"use client";
import { useEffect } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }} onClick={onClose}>
      <div style={{
        background: "#111417", border: "1px solid #1e2329", borderRadius: "12px",
        width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #1e2329" }}>
          <h2 style={{ color: "#f0f2f5", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7c8794", cursor: "pointer", fontSize: "1.25rem", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}
