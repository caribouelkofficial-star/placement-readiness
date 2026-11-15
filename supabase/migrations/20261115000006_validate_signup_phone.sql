-- Only keep a phone number that looks like +<country code><digits> (8 to 15 digits, optional spaces); otherwise store null.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid;
  raw_phone text := new.raw_user_meta_data ->> 'phone';
  cg numeric(3,2) := round((6 + random() * 3.5)::numeric, 2);
  apt int := 45 + floor(random() * 50)::int;
  cod int := 40 + floor(random() * 55)::int;
  com int := 50 + floor(random() * 45)::int;
begin
  insert into public.profiles (auth_user_id, full_name, email, phone)
  values (new.id,
          coalesce(nullif(left(btrim(new.raw_user_meta_data ->> 'full_name'), 60), ''), split_part(new.email, '@', 1)),
          new.email,
          case when raw_phone ~ '^\+[1-9][0-9 ]{7,18}$' and length(regexp_replace(raw_phone, '[^0-9]', '', 'g')) between 8 and 15
               then raw_phone end)
  returning id into pid;

  insert into public.student_academics values (pid, cg, apt, cod, com, array['Java', 'SQL']);

  insert into public.readiness_scores
  select pid, r.score, r.level, r.skills, r.careers from public.mock_readiness(cg, apt, cod, com) r;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles add constraint profiles_phone_format
  check (phone is null or phone ~ '^\+[1-9][0-9 ]{7,18}$') not valid;
