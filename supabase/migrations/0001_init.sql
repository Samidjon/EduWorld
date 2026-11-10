-- EduWorld initial schema
-- User data uses UUID keys. Learning content tables use stable text slugs (e.g. 'math.fractions')
-- because content is authored and versioned in git (src/data) and mirrored here by seed.sql.

create extension if not exists pgcrypto;

-- ============ Accounts ============
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'parent' check (role in ('parent', 'admin')),
  created_at timestamptz not null default now()
);

create table public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.parent_settings (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null unique references public.parent_profiles (id) on delete cascade,
  settings_json jsonb not null default '{}'::jsonb
);

-- ============ Content (mirrored from src/data, see seed.sql) ============
create table public.curricula (
  id text primary key,
  country_code text not null,
  name jsonb not null,
  language text not null,
  version text not null,
  status text not null check (status in ('draft', 'reviewed', 'published', 'archived')),
  source jsonb not null,
  official boolean not null default false
);

create table public.subjects (
  id text primary key,          -- slug
  name jsonb not null,
  slug text not null unique,
  description jsonb not null
);

create table public.worlds (
  id text primary key,          -- slug
  name jsonb not null,
  slug text not null unique,
  description jsonb not null,
  theme jsonb not null,
  unlock_requirements jsonb not null default '{}'::jsonb
);

create table public.topics (
  id text primary key,
  subject_id text not null references public.subjects (id),
  grade_from smallint not null,
  grade_to smallint not null,
  title jsonb not null,
  description jsonb not null,
  prerequisites text[] not null default '{}'
);

create table public.grade_subjects (
  id uuid primary key default gen_random_uuid(),
  grade smallint not null check (grade between -1 and 11),
  subject_id text not null references public.subjects (id),
  curriculum_id text not null references public.curricula (id),
  unique (grade, subject_id, curriculum_id)
);

create table public.lessons (
  id text primary key,
  topic_id text not null references public.topics (id),
  title jsonb not null,
  content jsonb not null,       -- full lesson document (intro, explanation, example, ...)
  difficulty smallint not null check (difficulty between 1 and 5),
  duration smallint not null,
  objectives jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'published', 'archived')),
  published boolean generated always as (status in ('reviewed', 'published')) stored
);

create table public.questions (
  id text primary key,
  lesson_id text not null references public.lessons (id) on delete cascade,
  type text not null,
  question_data jsonb not null,
  difficulty smallint not null,
  explanation jsonb not null
);

create table public.achievements (
  id text primary key,
  name jsonb not null,
  description jsonb not null,
  icon text not null,
  requirement jsonb not null
);

create table public.game_items (
  id text primary key,
  name jsonb not null,
  type text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  price integer not null default 0 check (price >= 0),
  asset_path text not null
);

-- ============ Children (no birth date stored: age in years + year recorded only) ============
create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  age_years smallint not null check (age_years between 3 and 18),
  age_recorded_year smallint not null,
  age_group text not null check (age_group in ('4-5', '6-7', '8-10', '11-13', '14-17')),
  current_grade text not null check (current_grade in ('none', 'prep', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'custom')),
  custom_level smallint check (custom_level between -1 and 11),
  country_code text not null check (char_length(country_code) between 2 and 4),
  curriculum_id text not null references public.curricula (id),
  interface_language text not null check (interface_language in ('ru', 'en', 'uz')),
  preferred_subjects text[] not null default '{}',
  learning_goal text not null default 'general',
  avatar_config jsonb not null default '{}'::jsonb,
  assessment_completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index child_profiles_parent_idx on public.child_profiles (parent_id);

create table public.game_profiles (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique references public.child_profiles (id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  coins integer not null default 0 check (coins >= 0),
  streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  home_config jsonb not null default '{"placed": [], "wallpaper": "sky"}'::jsonb
);

create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  lesson_id text not null,      -- lesson id, boss id or 'assessment'
  topic_id text not null,
  kind text not null check (kind in ('lesson', 'boss', 'assessment', 'review')),
  score numeric(4, 3),
  completed boolean not null default false,
  xp_awarded integer not null default 0,
  coins_awarded integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index lesson_attempts_child_idx on public.lesson_attempts (child_id, completed_at desc);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  question_id text not null,
  topic_id text not null,
  lesson_attempt_id uuid references public.lesson_attempts (id) on delete cascade,
  answer_data jsonb,            -- minimal payload, purged after 180 days (see purge_old_answers)
  is_correct boolean not null,
  hint_used boolean not null default false,
  created_at timestamptz not null default now()
);
create index question_attempts_child_idx on public.question_attempts (child_id, created_at desc);
create index question_attempts_attempt_idx on public.question_attempts (lesson_attempt_id);

create table public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  topic_id text not null,
  mastery_level numeric(4, 3) not null default 0.3 check (mastery_level between 0 and 1),
  attempts_count integer not null default 0,
  correct_count integer not null default 0,
  recent_results text not null default '',
  status text not null default 'new' check (status in ('new', 'learning', 'mastered', 'needs_review')),
  review_stage smallint not null default 0,
  placed_by_assessment boolean not null default false,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  unique (child_id, topic_id)
);

create table public.child_achievements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  unique (child_id, achievement_id)
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  item_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  acquired_at timestamptz not null default now(),
  unique (child_id, item_id)
);

create table public.daily_challenges (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  challenge_data jsonb not null
);
create index daily_challenges_date_idx on public.daily_challenges (date);

create table public.child_challenges (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  challenge_id uuid not null references public.daily_challenges (id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  unique (child_id, challenge_id)
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  game_id text not null,
  score integer not null check (score >= 0),
  max_score integer not null check (max_score > 0),
  xp_awarded integer not null default 0,
  coins_awarded integer not null default 0,
  created_at timestamptz not null default now()
);
create index game_sessions_child_idx on public.game_sessions (child_id, created_at desc);

create table public.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_sessions (id) on delete cascade,
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 8000),
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index ai_messages_child_idx on public.ai_messages (child_id, created_at desc);

create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles (id) on delete cascade,
  date date not null,
  minutes integer not null default 0,
  unique (child_id, date)
);

-- ============ Helper functions ============
create or replace function public.my_parent_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.parent_profiles where user_id = auth.uid()
$$;

create or replace function public.is_my_child(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.child_profiles cp
    join public.parent_profiles pp on pp.id = cp.parent_id
    where cp.id = c and pp.user_id = auth.uid()
  )
$$;

-- create public.users row for each new auth user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, role) values (new.id, new.email, 'parent');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- parents can delete their own account (cascades to all child data)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- retention: answers are only needed for recent mistake analysis
create or replace function public.purge_old_answers() returns void
language sql security definer set search_path = public as $$
  update public.question_attempts set answer_data = null where created_at < now() - interval '180 days';
  delete from public.ai_messages where created_at < now() - interval '90 days';
$$;

-- ============ Row Level Security ============
alter table public.users enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.parent_settings enable row level security;
alter table public.child_profiles enable row level security;
alter table public.game_profiles enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.question_attempts enable row level security;
alter table public.learning_progress enable row level security;
alter table public.child_achievements enable row level security;
alter table public.inventory enable row level security;
alter table public.child_challenges enable row level security;
alter table public.game_sessions enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.ai_messages enable row level security;
alter table public.daily_activity enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.curricula enable row level security;
alter table public.subjects enable row level security;
alter table public.worlds enable row level security;
alter table public.topics enable row level security;
alter table public.grade_subjects enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.achievements enable row level security;
alter table public.game_items enable row level security;

create policy users_self on public.users for select using (id = auth.uid());

create policy parent_self_select on public.parent_profiles for select using (user_id = auth.uid());
create policy parent_self_insert on public.parent_profiles for insert with check (user_id = auth.uid());
create policy parent_self_update on public.parent_profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy parent_self_delete on public.parent_profiles for delete using (user_id = auth.uid());

create policy settings_own on public.parent_settings for all using (parent_id = public.my_parent_id()) with check (parent_id = public.my_parent_id());

create policy children_own on public.child_profiles for all using (parent_id = public.my_parent_id()) with check (parent_id = public.my_parent_id());

-- every per-child table: only the owning parent's session can read/write
do $$
declare t text;
begin
  foreach t in array array['game_profiles','lesson_attempts','question_attempts','learning_progress','child_achievements','inventory','child_challenges','game_sessions','ai_sessions','ai_messages','daily_activity']
  loop
    execute format('create policy %I on public.%I for all using (public.is_my_child(child_id)) with check (public.is_my_child(child_id))', t || '_own', t);
  end loop;
end $$;

-- daily challenges are shared, generated on demand
create policy daily_read on public.daily_challenges for select to authenticated using (true);
create policy daily_insert on public.daily_challenges for insert to authenticated with check (date = current_date);

-- public content is readable; only reviewed/published lessons
create policy curricula_read on public.curricula for select using (status <> 'archived');
create policy subjects_read on public.subjects for select using (true);
create policy worlds_read on public.worlds for select using (true);
create policy topics_read on public.topics for select using (true);
create policy grade_subjects_read on public.grade_subjects for select using (true);
create policy lessons_read on public.lessons for select using (published);
create policy questions_read on public.questions for select using (exists (select 1 from public.lessons l where l.id = lesson_id and l.published));
create policy achievements_read on public.achievements for select using (true);
create policy items_read on public.game_items for select using (true);
