-- AI Tools Knowledge Base — initial schema

create extension if not exists "uuid-ossp";

-- AI tools with guides
create table tools (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  monitor_url text,
  guide_markdown text,
  last_scraped_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-detected updates from scraping
create table scrape_updates (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid not null references tools(id) on delete cascade,
  diff_summary text not null,
  seen boolean default false,
  detected_at timestamptz default now()
);

-- Team cases (real usage examples)
create table cases (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid not null references tools(id) on delete cascade,
  task_name text not null,
  task_details text,
  approach text,
  iterations integer,
  outcome text,
  success boolean default true,
  time_spent_min integer,
  time_without_ai_min integer,
  source text default 'web' check (source in ('web', 'extension')),
  created_at timestamptz default now()
);

-- Team context (single row, editable in settings)
create table team_context (
  id uuid primary key default uuid_generate_v4(),
  content text not null default '',
  updated_at timestamptz default now()
);

-- Insert initial team context
insert into team_context (content) values (
  'Ми — команда performance marketing. Займаємось створенням рекламних відеокреативів, банерів та анімацій для соціальних мереж (Instagram, TikTok, Facebook). Головні задачі: генерація відео з продуктами, анімація статичних зображень, кінематографічні відео-фони, стилізовані рекламні ролики. Інструменти: Higgsfield (кінематографічні відео), Kling (image-to-video, довші відео).'
);

-- Seed tools
insert into tools (slug, name, description, monitor_url) values
(
  'higgsfield',
  'Higgsfield',
  'AI відеогенератор з фокусом на кінематографічну якість та контроль руху камери.',
  'https://higgsfield.ai'
),
(
  'kling',
  'Kling',
  'AI відеогенератор від Kuaishou. Підходить для image-to-video та довших відео (до 3 хв у Pro).',
  'https://klingai.com'
);

-- Indexes
create index on scrape_updates(tool_id);
create index on scrape_updates(seen);
create index on cases(tool_id);
create index on cases(created_at desc);
