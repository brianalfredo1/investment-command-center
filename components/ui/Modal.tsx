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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
      onClick={onClose}
    >
      {/* Sheet slides up from bottom on mobile, centered on desktop */}
      <style>{`
        .modal-sheet {
          background: #111417;
          border: 1px solid #1e2329;
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 16px 16px 0 0;
        }
        @media (min-width: 640px) {
          .modal-sheet {
            border-radius: 12px;
            margin: auto;
          }
        }
      `}</style>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Drag handle — mobile only visual cue */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0.625rem 0 0" }}>
          <div style={{ width: 36, height: 4, background: "#1e2329", borderRadius: 2 }} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.875rem 1.25rem", borderBottom: "1px solid #1e2329",
        }}>
          <h2 style={{ color: "#f0f2f5", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7c8794", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}
