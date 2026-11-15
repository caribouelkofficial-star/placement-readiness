-- Phone number captured at signup (auth metadata -> profiles.phone).
alter table public.profiles add column phone text;

create or replace function public.handle_new_user()
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
  insert into public.profiles (auth_user_id, full_name, email, phone)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
          new.email,
          nullif(left(new.raw_user_meta_data ->> 'phone', 20), ''))
  returning id into pid;

  insert into public.student_academics values (pid, cg, apt, cod, com, array['Java', 'SQL']);

  insert into public.readiness_scores
  select pid, r.score, r.level, r.skills, r.careers from public.mock_readiness(cg, apt, cod, com) r;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
