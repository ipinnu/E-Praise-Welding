-- Run this in your Supabase SQL editor to set up the portal schema

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamptz default now()
);

-- Messages (single thread per client ↔ admin pair)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  context_label text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Attachments
create table if not exists attachments (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references messages(id) on delete cascade not null,
  storage_url text not null,
  file_name text not null,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table messages enable row level security;
alter table attachments enable row level security;

-- Profiles policies
create policy "Users read own profile" on profiles
  for select using (auth.uid() = id);

create policy "Admin reads all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- Messages policies
create policy "Users see their messages" on messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users send messages" on messages
  for insert with check (auth.uid() = sender_id);

-- Attachments policies
create policy "Users see their attachments" on attachments
  for select using (
    exists (
      select 1 from messages
      where id = message_id
        and (sender_id = auth.uid() or recipient_id = auth.uid())
    )
  );

create policy "Users insert attachments" on attachments
  for insert with check (
    exists (
      select 1 from messages
      where id = message_id and sender_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Gallery items
create table if not exists gallery_items (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Untitled',
  description text default '',
  image_path text not null,
  category text default 'Fabrication' check (category in ('Fabrication', 'Sculpture', 'Structural', 'Ornamental')),
  size text default 'medium' check (size in ('large', 'medium', 'small')),
  orientation text default 'portrait' check (orientation in ('portrait', 'landscape')),
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table gallery_items enable row level security;

create policy "Public read gallery" on gallery_items
  for select using (true);

create policy "Admin manage gallery" on gallery_items
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Seed gallery items (run once)
insert into gallery_items (title, description, image_path, category, size, order_index) values
  ('Wardrobe', 'Custom metal wardrobe frame with precision welding', 'Wardrobe.PNG', 'Fabrication', 'large', 1),
  ('Wardrobe Series II', 'Second in our custom wardrobe collection', 'Wardrobe (2).PNG', 'Fabrication', 'medium', 2),
  ('Wardrobe Series III', 'Refined wardrobe design with decorative elements', 'Wardrobe (3).PNG', 'Fabrication', 'medium', 3),
  ('Wardrobe Series IV', 'Four-panel wardrobe with ornamental accents', 'wardrobe (4).PNG', 'Fabrication', 'small', 4),
  ('Security Gate', 'Heavy-duty security gate with ornamental ironwork', 'Gate.jpeg', 'Ornamental', 'large', 5),
  ('Aesthetic Pieces', 'Decorative metal art pieces for interior spaces', 'Aesthetic pieces.WEBP', 'Sculpture', 'medium', 6),
  ('Metal Design Front Entrance', 'Grand entrance metalwork with custom design', 'Metal design front entrance.WEBP', 'Ornamental', 'large', 7),
  ('Custom Work 01', 'Custom fabrication project', 'IMG_0936.PNG', 'Fabrication', 'medium', 8),
  ('Custom Work 02', 'Precision metalwork project', 'IMG_1720.JPG.jpeg', 'Fabrication', 'small', 9),
  ('Custom Work 03', 'Structural steel project', 'IMG_0935.PNG', 'Structural', 'medium', 10),
  ('Custom Work 04', 'Ornamental iron installation', 'IMG_0925.PNG', 'Ornamental', 'large', 11),
  ('Custom Work 05', 'Welded art piece', 'IMG_0922.PNG', 'Sculpture', 'small', 12),
  ('Custom Work 06', 'Custom fabrication', 'IMG_0928.PNG', 'Fabrication', 'medium', 13),
  ('Custom Work 07', 'Metal design project', 'IMG_0917.PNG', 'Fabrication', 'large', 14),
  ('Custom Work 08', 'Steel structure work', 'IMG_0909.PNG', 'Structural', 'small', 15),
  ('Custom Work 09', 'Ornamental metalwork', 'IMG_0916.PNG', 'Ornamental', 'medium', 16),
  ('Custom Work 10', 'Custom welding project', 'IMG_0911.PNG', 'Fabrication', 'large', 17),
  ('Custom Work 11', 'Metal fabrication', 'IMG_0907.PNG', 'Fabrication', 'small', 18),
  ('Custom Work 12', 'Steel art installation', 'IMG_0908.PNG', 'Sculpture', 'medium', 19),
  ('Custom Work 13', 'Custom iron design', 'IMG_0919.PNG', 'Ornamental', 'small', 20),
  ('Custom Work 14', 'Precision welding work', 'IMG_0906.PNG', 'Fabrication', 'medium', 21),
  ('Custom Work 15', 'Metal art piece', 'IMG_0896.WEBP', 'Sculpture', 'large', 22),
  ('Custom Work 16', 'Steel fabrication project', 'IMG_0894.PNG', 'Fabrication', 'small', 23),
  ('Custom Work 17', 'Ornamental gate design', 'IMG_0897.WEBP', 'Ornamental', 'medium', 24),
  ('Custom Work 18', 'Custom metalwork', 'IMG_0865.JPG.jpeg', 'Fabrication', 'large', 25),
  ('Custom Work 19', 'Steel structure', 'IMG_0853.JPG.jpeg', 'Structural', 'medium', 26),
  ('Custom Work 20', 'Welded sculpture', 'IMG_0867.JPG.jpeg', 'Sculpture', 'small', 27),
  ('Water Tank Structure', 'Custom steel water tank support structure — engineered for load-bearing strength and weather resistance', 'Water tank structure.jpeg', 'Structural', 'large', 28)
on conflict do nothing;

-- Storage bucket for gallery uploads (public)
insert into storage.buckets (id, name, public) values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;

-- Storage policies for gallery-images (run after bucket exists)
-- create policy "Public read gallery images" on storage.objects
--   for select using (bucket_id = 'gallery-images');
-- create policy "Admin upload gallery images" on storage.objects
--   for insert with check (bucket_id = 'gallery-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
-- create policy "Admin update gallery images" on storage.objects
--   for update using (bucket_id = 'gallery-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
-- create policy "Admin delete gallery images" on storage.objects
--   for delete using (bucket_id = 'gallery-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Storage bucket for chat attachments
-- Run this separately or via Supabase dashboard:
-- insert into storage.buckets (id, name, public) values ('chat-attachments', 'chat-attachments', false);

-- Storage policies (run after creating bucket)
-- create policy "Users upload own attachments" on storage.objects
--   for insert with check (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users read own attachments" on storage.objects
--   for select using (bucket_id = 'chat-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Recipients read attachments" on storage.objects
--   for select using (bucket_id = 'chat-attachments');
