-- Trader OS V1 — migration non destructive. À relire avant exécution distante.
create table if not exists market_events (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  detected_at timestamptz not null default now(),
  published_at timestamptz,
  source text not null,
  event_type text not null,
  title text not null,
  summary text,
  countries jsonb not null default '[]'::jsonb,
  entities jsonb not null default '[]'::jsonb,
  affected_assets jsonb not null default '[]'::jsonb,
  original_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists trade_proposals (
  id uuid primary key default gen_random_uuid(),
  market_event_id uuid references market_events(id) on delete set null,
  symbol text not null,
  direction text not null check (direction in ('long','short','neutral')),
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  entry_price numeric,
  stop_price numeric,
  target_price numeric,
  quantity numeric,
  risk_amount numeric,
  status text not null default 'draft',
  mode text not null default 'paper' check (mode = 'paper'),
  thesis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists risk_reviews (
  id uuid primary key default gen_random_uuid(),
  trade_proposal_id uuid not null references trade_proposals(id) on delete cascade,
  approved boolean not null,
  reasons jsonb not null default '[]'::jsonb,
  reviewed_at timestamptz not null default now()
);

create table if not exists paper_orders (
  id uuid primary key default gen_random_uuid(),
  trade_proposal_id uuid not null references trade_proposals(id) on delete restrict,
  status text not null default 'pending',
  submitted_at timestamptz,
  filled_at timestamptz,
  fill_price numeric,
  closed_at timestamptz,
  exit_price numeric,
  pnl numeric,
  created_at timestamptz not null default now()
);

create index if not exists market_events_detected_at_idx on market_events (detected_at desc);
create index if not exists trade_proposals_status_idx on trade_proposals (status, created_at desc);
