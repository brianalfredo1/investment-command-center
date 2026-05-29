export type PositionCategory =
  | "stocks"
  | "crypto"
  | "etf"
  | "real_estate"
  | "bonds"
  | "cash"
  | "other";

export type PositionStatus = "active" | "closed" | "pending";

export interface Position {
  id: string;
  name: string;
  category: PositionCategory;
  cost_basis: number;
  current_value: number;
  entry_date: string;
  status: PositionStatus;
  platform: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioMetrics {
  total_invested: number;
  current_value: number;
  overall_roi: number;
  profitable_count: number;
  total_positions: number;
}
