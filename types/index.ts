export type PositionCategory = "Crypto" | "Stocks" | "ETF" | "Real Estate" | "Bonds" | "Trading" | "Business" | "Other";
export type PositionStatus = "Active" | "Closed" | "Pending";

export interface Position {
  id: string;
  user_id: string;
  name: string;
  subtitle: string;
  category: PositionCategory;
  cost_basis: number;
  current_value: number;
  entry_date: string;
  status: PositionStatus;
  platform: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioMetrics {
  total_invested: number;
  current_value: number;
  overall_roi: number;
  profitable_count: number;
  total_positions: number;
}

export interface ExtractedPosition {
  name: string;
  sub: string;
  category: PositionCategory;
  source: string;
  initial: number;
  current: number;
  status: PositionStatus;
}
