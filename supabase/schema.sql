create extension if not exists pgcrypto;

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  rank integer not null default 0,
  team_name text not null,
  project_title text not null,
  score integer not null check (score >= 0),
  is_disqualified boolean not null default false,
  members integer not null check (members >= 1),
  created_at timestamptz not null default now()
);

alter table public.leaderboard_entries
  add column if not exists is_disqualified boolean not null default false;

create index if not exists idx_leaderboard_rank on public.leaderboard_entries(rank);
create index if not exists idx_leaderboard_score on public.leaderboard_entries(score desc);
create index if not exists idx_leaderboard_disqualified on public.leaderboard_entries(is_disqualified);

create table if not exists public.qualified_teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  logo_url text not null,
  participant_names text[] not null,
  college_name text not null,
  created_at timestamptz not null default now(),
  constraint qualified_teams_participants_count_check check (cardinality(participant_names) between 2 and 6)
);

create index if not exists idx_qualified_teams_team_name on public.qualified_teams(team_name);
create index if not exists idx_qualified_teams_college_name on public.qualified_teams(college_name);

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

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  tag text not null default 'Update',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_created_at on public.announcements(created_at desc);
create index if not exists idx_announcements_updated_at on public.announcements(updated_at desc);

create table if not exists public.publish_state (
  section text primary key check (section in ('leaderboard', 'winners', 'problemStatements', 'problemStatementsDownload', 'qualifiedTeams')),
  is_live boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.publish_state
drop constraint if exists publish_state_section_check;

alter table public.publish_state
add constraint publish_state_section_check
check (section in ('leaderboard', 'winners', 'problemStatements', 'problemStatementsDownload', 'qualifiedTeams'));

create table if not exists public.site_settings (
  key text primary key,
  value_text text,
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  secondary_logo_url text,
  website_url text,
  category text not null,
  title_primary text,
  title_secondary text,
  description text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sponsors
add column if not exists secondary_logo_url text;

alter table public.sponsors
add column if not exists title_primary text;

alter table public.sponsors
add column if not exists title_secondary text;

create index if not exists idx_sponsors_display_order on public.sponsors(display_order);
create index if not exists idx_sponsors_category on public.sponsors(category);
create index if not exists idx_sponsors_featured on public.sponsors(is_featured);

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
  ('problemStatementsDownload', false),
  ('qualifiedTeams', false)
on conflict (section) do nothing;

insert into public.site_settings(key, value_text)
values
  ('registration_link', 'https://unstop.com/')
on conflict (key) do nothing;

insert into public.site_settings(key, value_text)
values
  ('navbar_show_leaderboard', 'true'),
  ('navbar_show_winners', 'true'),
  ('navbar_show_qualified_teams', 'true')
on conflict (key) do nothing;

create table if not exists public.website_visitors (
  visitor_id text primary key,
  visit_count integer not null default 0 check (visit_count >= 0),
  first_visited_at timestamptz not null default now(),
  last_visited_at timestamptz not null default now(),
  last_path text not null default '/'
);

create index if not exists idx_website_visitors_last_visited_at on public.website_visitors(last_visited_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'qualified-teams',
  'qualified-teams',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
