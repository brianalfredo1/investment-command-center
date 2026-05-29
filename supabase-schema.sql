-- ============================================================
-- Investment Command Center — Supabase Schema
-- Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

create table if not exists positions (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null default 'demo',
  name          text not null,
  subtitle      text not null default '',
  category      text not null default 'Other',
  cost_basis    numeric(15,2) not null default 0,
  current_value numeric(15,2) not null default 0,
  entry_date    date not null default current_date,
  status        text not null default 'Active',
  platform      text not null default '',
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table positions enable row level security;

create policy "Allow demo user"
  on positions for all
  using (user_id = 'demo')
  with check (user_id = 'demo');

create policy "Authenticated users manage own positions"
  on positions for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger positions_updated_at
  before update on positions
  for each row execute function update_updated_at();

create index if not exists positions_user_id_idx on positions(user_id);

-- ============================================================
-- Seed data — run after table creation
-- ============================================================
insert into positions (user_id, name, subtitle, category, cost_basis, current_value, status, platform) values
  ('demo','BTC',  'Bitcoin',              'Crypto', 1295.61,1664.71,'Active','Binance'),
  ('demo','SOL',  'Solana',               'Crypto', 1670.07, 834.49,'Active','Binance'),
  ('demo','ZRO',  'LayerZero',            'Crypto', 1060.51, 377.40,'Active','Binance'),
  ('demo','ETH',  'Ethereum',             'Crypto',  328.93, 168.48,'Active','Binance'),
  ('demo','DOGE', 'Dogecoin',             'Crypto',   55.06,  45.23,'Active','Binance'),
  ('demo','SEI',  'Sei',                  'Crypto',  113.01,  11.35,'Active','Binance'),
  ('demo','TIA',  'Celestia',             'Crypto',  103.51,   5.25,'Active','Binance'),
  ('demo','S',    'Sonic',                'Crypto',    0.00,   4.29,'Active','Binance'),
  ('demo','MANTA','Manta',                'Crypto',   38.20,   2.69,'Active','Binance'),
  ('demo','GMX',  'GMX',                  'Crypto',   11.27,   1.90,'Active','Binance'),
  ('demo','USDT', 'TetherUS',             'Crypto',    1.00,   1.00,'Active','Binance'),
  ('demo','USDC', 'USD Coin',             'Crypto',    0.83,   0.83,'Active','Binance'),
  ('demo','BBCA', 'Bank Central Asia',    'Stocks',  110.74, 107.21,'Active','Stockbit'),
  ('demo','GOTO', 'GoTo Gojek Tokopedia', 'Stocks',    1.84,   1.84,'Active','Stockbit'),
  ('demo','UpOnlyTrader','Trading account','Trading', 416.34, 341.48,'Active','UpOnly')
on conflict do nothing;
