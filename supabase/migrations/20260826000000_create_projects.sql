create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text not null default '',
  location text not null default '',
  project_type text not null default '',
  year text not null default '',
  status text not null check (status in ('Built', 'Proposed', 'In progress', 'Concept')),
  images text[] not null default '{}',
  visible boolean not null default true,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

create policy "Published projects are public" on public.projects for select to anon, authenticated using (visible or public.is_admin());
create policy "Administrators create projects" on public.projects for insert to authenticated with check (public.is_admin());
create policy "Administrators update projects" on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Administrators delete projects" on public.projects for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 12582912, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Project images are publicly readable" on storage.objects for select to public using (bucket_id = 'project-images');
create policy "Administrators upload project images" on storage.objects for insert to authenticated with check (bucket_id = 'project-images' and public.is_admin());
create policy "Administrators update project images" on storage.objects for update to authenticated using (bucket_id = 'project-images' and public.is_admin()) with check (bucket_id = 'project-images' and public.is_admin());
create policy "Administrators delete project images" on storage.objects for delete to authenticated using (bucket_id = 'project-images' and public.is_admin());

insert into public.projects (id, name, description, location, project_type, year, status, images, visible, featured, display_order)
values
  ('hotel-sai-karthik', 'Hotel Sai Karthik', 'A highway restaurant with a bold contemporary frontage, clear arrival sequence and a distinctive street presence.', 'Tiruchirappalli, Tamil Nadu', 'Hospitality', '2024', 'Proposed', array['/assets/selected/hotel-sai-karthik.png', '/assets/projects/hotel-sai-karthik/b-1-.jpg', '/assets/projects/hotel-sai-karthik/b-2-.jpg', '/assets/projects/hotel-sai-karthik/b-4-.jpg'], true, true, 0),
  ('ramu-residence', 'Ramu Residence', 'A contemporary urban residence composed with deep balconies, layered screens and generous shaded outdoor spaces.', 'Keeranur, Tamil Nadu', 'Residential', '2023', 'Proposed', array['/assets/selected/ramu-residence.png', '/assets/projects/ramu-residence/drrbker28022023-2-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-1-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-2-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-3-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-4-.jpg', '/assets/projects/ramu-residence/drrbkr23022023-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-01-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-02-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-03-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-04-.jpg'], true, false, 1),
  ('senthil-residence', 'D Senthil Residence', 'A warm bedroom interior shaped by crafted timber surfaces, integrated storage and carefully layered lighting.', 'Thiruvarur, Tamil Nadu', 'Residential · Interiors', '2024', 'Proposed', array['/assets/selected/senthil-bedroom.png', '/assets/projects/senthil-residence/1-.jpg', '/assets/projects/senthil-residence/dsrbtvr-20092024-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-1-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-2-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-1-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-2-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-3-.jpg'], true, false, 2),
  ('valliappan-residence', 'Valliappan Residence', 'A courtyard-minded home that reinterprets the Tamil verandah through a measured contemporary plan.', 'Thanjavur, Tamil Nadu', 'Residential', '2022', 'Proposed', array['/assets/selected/valliappan-residence.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-1-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-2-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-3-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-4-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-5-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-6-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-7-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-9-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-10-.jpg'], true, false, 3)
on conflict (id) do nothing;
