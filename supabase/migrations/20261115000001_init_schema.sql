-- Placement Readiness: schema, signup trigger, RLS, demo seed data.
-- The Spring Boot backend connects as a privileged DB role; the browser only talks to
-- Supabase Auth. RLS is enabled with no policies, so the public Data API exposes nothing.

create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete cascade,  -- null for seeded demo students
  full_name     text not null,
  email         text not null unique,
  role          text not null default 'student' check (role in ('student', 'admin')),
  branch        text,
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

create table public.student_academics (
  profile_id          uuid primary key references public.profiles (id) on delete cascade,
  cgpa                numeric(3,2) not null check (cgpa between 0 and 10),
  aptitude_score      int not null check (aptitude_score between 0 and 100),
  coding_score        int not null check (coding_score between 0 and 100),
  communication_score int not null check (communication_score between 0 and 100),
  skills              text[] not null default '{}'
);

create table public.readiness_scores (
  profile_id          uuid primary key references public.profiles (id) on delete cascade,
  score               int not null check (score between 0 and 100),
  level               text not null check (level in ('Beginner', 'Developing', 'Ready', 'Placement Ready')),
  recommended_skills  text[] not null default '{}',
  recommended_careers text[] not null default '{}'
);

create table public.login_events (
  id           bigint generated always as identity primary key,
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  logged_in_at timestamptz not null default now()
);
create index login_events_profile_idx on public.login_events (profile_id, logged_in_at desc);

alter table public.profiles          enable row level security;
alter table public.student_academics enable row level security;
alter table public.readiness_scores  enable row level security;
alter table public.login_events      enable row level security;

-- Mock (non-AI) readiness: deterministic formula over the academic numbers.
create function public.mock_readiness(cgpa numeric, aptitude int, coding int, comm int)
returns table (score int, level text, skills text[], careers text[])
language sql immutable
set search_path = ''
as $$
  with s as (select round(cgpa * 10 * 0.25 + aptitude * 0.25 + coding * 0.35 + comm * 0.15)::int as v)
  select
    s.v,
    case when s.v >= 80 then 'Placement Ready' when s.v >= 65 then 'Ready'
         when s.v >= 50 then 'Developing' else 'Beginner' end,
    case when coding < 60 then array['Data Structures', 'Algorithms', 'Problem Solving']
         else array['System Design', 'SQL', 'Mock Interviews'] end,
    case when coding >= 70 then array['Software Engineer', 'Backend Developer']
         when aptitude >= 70 then array['Data Analyst', 'Business Analyst']
         else array['QA Engineer', 'Support Engineer'] end
  from s;
$$;

-- On every Supabase signup: create a student profile with mock academics + readiness.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid;
  cg numeric(3,2) := round((6 + random() * 3.5)::numeric, 2);
  apt int := 45 + floor(random() * 50)::int;
  cod int := 40 + floor(random() * 55)::int;
  com int := 50 + floor(random() * 45)::int;
begin
  insert into public.profiles (auth_user_id, full_name, email)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
          new.email)
  returning id into pid;

  insert into public.student_academics values (pid, cg, apt, cod, com, array['Java', 'SQL']);

  insert into public.readiness_scores
  select pid, r.score, r.level, r.skills, r.careers from public.mock_readiness(cg, apt, cod, com) r;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.mock_readiness(numeric, int, int, int) from public, anon, authenticated;

-- Demo students (no auth account; they appear in the admin list as dummy data).
do $$
declare
  names text[]    := array['Aarav Sharma','Priya Nair','Rohan Mehta','Sneha Iyer','Karan Singh','Ananya Das',
                           'Vikram Rao','Isha Gupta','Aditya Verma','Neha Kulkarni','Rahul Joshi','Meera Reddy'];
  branches text[] := array['CSE','IT','ECE','CSE','AI&DS','IT','CSE','ECE','CSE','IT','AI&DS','CSE'];
  cgpas numeric[] := array[8.9,7.4,6.8,9.2,7.9,6.2,8.4,7.1,8.0,6.6,9.0,7.7];
  apts int[]      := array[85,70,58,92,74,50,80,66,77,55,88,72];
  cods int[]      := array[90,64,52,95,70,45,82,58,75,48,91,68];
  coms int[]      := array[80,72,60,88,70,55,78,65,74,62,85,70];
  i int; pid uuid;
begin
  for i in 1..array_length(names, 1) loop
    insert into public.profiles (full_name, email, branch, last_login_at)
    values (names[i], lower(replace(names[i], ' ', '.')) || '@demo.edu', branches[i],
            now() - (i * interval '5 hours'))
    returning id into pid;

    insert into public.student_academics
    values (pid, cgpas[i], apts[i], cods[i], coms[i], array['Java', 'SQL', 'React']);

    insert into public.readiness_scores
    select pid, r.score, r.level, r.skills, r.careers
    from public.mock_readiness(cgpas[i], apts[i], cods[i], coms[i]) r;

    insert into public.login_events (profile_id, logged_in_at)
    values (pid, now() - (i * interval '5 hours'));
  end loop;
end $$;
