-- Audit trail of password changes made through the API.
create table public.password_events (
  id         bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  changed_at timestamptz not null default now()
);
create index password_events_profile_idx on public.password_events (profile_id, changed_at desc);
alter table public.password_events enable row level security;
grant select, insert on public.password_events to app_backend;
grant usage, select on all sequences in schema public to app_backend;
