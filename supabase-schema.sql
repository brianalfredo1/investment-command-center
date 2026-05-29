-- Positions table
create table positions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  category text not null check (category in ('stocks','crypto','etf','real_estate','bonds','cash','other')),
  cost_basis numeric(15,2) not null,
  current_value numeric(15,2) not null,
  entry_date date not null,
  status text not null default 'active' check (status in ('active','closed','pending')),
  platform text not null default '',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table positions enable row level security;

create policy "Users can manage own positions"
  on positions for all
  using (auth.uid()::text = user_id);

create index positions_user_id_idx on positions(user_id);
