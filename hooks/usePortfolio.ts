"use client";
import { useState, useEffect, useCallback } from "react";
import type { Position, PortfolioMetrics } from "@/types";

export function usePortfolio(userId = "demo") {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/positions?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch positions");
      const data = await res.json();
      setPositions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const addPosition = async (pos: Omit<Position, "id" | "created_at" | "updated_at">) => {
    const res = await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pos),
    });
    if (!res.ok) throw new Error("Failed to add position");
    await fetchPositions();
  };

  const updatePosition = async (id: string, updates: Partial<Position>) => {
    const res = await fetch("/api/positions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error("Failed to update position");
    await fetchPositions();
  };

  const deletePosition = async (id: string) => {
    const res = await fetch(`/api/positions?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete position");
    await fetchPositions();
  };

  const metrics: PortfolioMetrics = {
    total_invested: positions.reduce((s, p) => s + Number(p.cost_basis), 0),
    current_value: positions.reduce((s, p) => s + Number(p.current_value), 0),
    overall_roi: (() => {
      const invested = positions.reduce((s, p) => s + Number(p.cost_basis), 0);
      const current = positions.reduce((s, p) => s + Number(p.current_value), 0);
      return invested > 0 ? ((current - invested) / invested) * 100 : 0;
    })(),
    profitable_count: positions.filter(p => Number(p.current_value) > Number(p.cost_basis)).length,
    total_positions: positions.length,
  };

  return { positions, metrics, loading, error, addPosition, updatePosition, deletePosition, refetch: fetchPositions };
}
