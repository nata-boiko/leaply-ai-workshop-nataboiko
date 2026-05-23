-- Manual notes (never overwritten by auto-scrape)
alter table tools add column if not exists manual_notes text;

-- Useful links: [{title, url, added_at}]
alter table tools add column if not exists links jsonb default '[]'::jsonb;
