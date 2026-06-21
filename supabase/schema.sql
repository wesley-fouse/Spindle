-- Spindle schema. Paste into Supabase: SQL Editor -> New query -> Run.
-- Safe to re-run (drops policies/tables it owns first).

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  bio          text,
  favorites    text[] not null default '{}',  -- album_ids (Apple collectionId), up to 4
  created_at   timestamptz not null default now()
);

-- ---------- ENTRIES (a user's diary / library row per album) ----------
create table if not exists public.entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  album_id     text not null,            -- Apple Music collectionId (canonical key)
  title        text,
  artist       text,
  artist_id    text,
  year         text,
  genre        text,
  art          text,
  listened     boolean not null default false,
  want         boolean not null default false,
  liked        boolean not null default false,
  rating       int check (rating between 0 and 5),
  note         text,
  listened_on  date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, album_id)
);
create index if not exists entries_user_idx     on public.entries(user_id);
create index if not exists entries_album_idx    on public.entries(album_id);
create index if not exists entries_listened_idx on public.entries(listened, listened_on desc);

-- ---------- FOLLOWS ----------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------- ROW LEVEL SECURITY ----------
-- Model: profiles, entries and follows are publicly readable (a public music
-- diary, like Letterboxd's default), but each row is writable only by its owner.
alter table public.profiles enable row level security;
alter table public.entries  enable row level security;
alter table public.follows  enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles write"  on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles write"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "entries read"   on public.entries;
drop policy if exists "entries insert" on public.entries;
drop policy if exists "entries update" on public.entries;
drop policy if exists "entries delete" on public.entries;
create policy "entries read"   on public.entries for select using (true);
create policy "entries insert" on public.entries for insert with check (auth.uid() = user_id);
create policy "entries update" on public.entries for update using (auth.uid() = user_id);
create policy "entries delete" on public.entries for delete using (auth.uid() = user_id);

drop policy if exists "follows read"   on public.follows;
drop policy if exists "follows insert" on public.follows;
drop policy if exists "follows delete" on public.follows;
create policy "follows read"   on public.follows for select using (true);
create policy "follows insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows delete" on public.follows for delete using (auth.uid() = follower_id);

-- ---------- AUTO-CREATE A PROFILE ON SIGNUP ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- keep updated_at fresh ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists entries_touch on public.entries;
create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();
