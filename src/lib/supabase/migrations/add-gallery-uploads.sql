-- Run in Supabase SQL editor after the main schema

alter table gallery_items
  add column if not exists orientation text default 'portrait'
  check (orientation in ('portrait', 'landscape'));

update gallery_items
set orientation = case
  when size = 'large' then 'landscape'
  else 'portrait'
end
where orientation is null or orientation = 'portrait';

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

create policy "Public read gallery images"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

create policy "Admin upload gallery images"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin update gallery images"
  on storage.objects for update
  using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin delete gallery images"
  on storage.objects for delete
  using (
    bucket_id = 'gallery-images'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
