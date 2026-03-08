create extension if not exists pgcrypto;

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  rank integer not null default 0,
  team_name text not null,
  project_title text not null,
  score integer not null check (score >= 0),
  members integer not null check (members >= 1),
  created_at timestamptz not null default now()
);

create index if not exists idx_leaderboard_rank on public.leaderboard_entries(rank);
create index if not exists idx_leaderboard_score on public.leaderboard_entries(score desc);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  rank integer not null default 0,
  team_name text not null,
  title text not null,
  prize_amount text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_winners_rank on public.winners(rank);

create table if not exists public.problem_statements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  domain text not null,
  description text not null,
  pdf_link text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.publish_state (
  section text primary key check (section in ('leaderboard', 'winners', 'problemStatements', 'problemStatementsDownload')),
  is_live boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value_text text,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  password_encrypted text,
  is_super_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users
add column if not exists password_encrypted text;

create index if not exists idx_admin_users_email on public.admin_users(email);

insert into public.publish_state(section, is_live)
values
  ('leaderboard', false),
  ('winners', false),
  ('problemStatements', false),
  ('problemStatementsDownload', false)
on conflict (section) do nothing;

insert into public.site_settings(key, value_text)
values
  ('registration_link', 'https://unstop.com/')
on conflict (key) do nothing;
