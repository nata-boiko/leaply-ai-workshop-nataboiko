-- Subscriptions + monthly usage tracking (budget / credits dashboard)

-- One subscription per shared service account (optionally linked to a tool)
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid references tools(id) on delete set null,
  name text not null,
  plan_name text,
  status text not null default 'active' check (status in ('active', 'new', 'canceled')),
  currency text not null default 'USD',
  cost_per_cycle numeric not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  renewal_date date,
  credits_included numeric,
  credits_unit text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One row per (subscription, month) — manual monthly snapshot of consumption
create table usage_logs (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  period_month date not null,
  credits_used numeric not null default 0,
  credits_remaining numeric,
  creo_count integer not null default 0,
  extra_credits_cost numeric not null default 0,
  extra_credits_source text,
  recorded_at timestamptz default now(),
  unique (subscription_id, period_month)
);

create index on subscriptions(tool_id);
create index on subscriptions(status);
create index on subscriptions(renewal_date);
create index on usage_logs(subscription_id);
create index on usage_logs(period_month desc);
