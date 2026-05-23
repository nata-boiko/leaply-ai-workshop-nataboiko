-- Add photos array to cases
alter table cases add column if not exists photos text[] default '{}';

-- Create storage bucket for case photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-photos',
  'case-photos',
  true,
  5242880, -- 5MB per file
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Public read policy
create policy "Public read case photos"
  on storage.objects for select
  using (bucket_id = 'case-photos');

-- Allow insert (anon can upload)
create policy "Allow upload case photos"
  on storage.objects for insert
  with check (bucket_id = 'case-photos');

-- Allow delete
create policy "Allow delete case photos"
  on storage.objects for delete
  using (bucket_id = 'case-photos');
