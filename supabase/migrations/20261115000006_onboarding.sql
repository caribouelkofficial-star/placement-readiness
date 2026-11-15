-- Onboarding: real signups fill a form after first login; dashboards are derived from it.
alter table public.profiles add column onboarded boolean not null default false;
update public.profiles set onboarded = true where auth_user_id is null;  -- seeded demo students

create table public.student_onboarding (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.student_onboarding enable row level security;
grant select, insert, update on public.student_onboarding to app_backend;
