-- Least-privilege role the Spring Boot backend connects as. Set the real password out-of-band
-- (alter role app_backend password '...'); never commit it.
create role app_backend login bypassrls password 'CHANGE_ME';
grant usage on schema public to app_backend;
grant select, insert, update on public.profiles, public.student_academics, public.readiness_scores, public.login_events to app_backend;
grant usage, select on all sequences in schema public to app_backend;
