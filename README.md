# Placement Readiness

Student placement-readiness dashboard. Login/logout via Supabase Auth; everything else is mock data served from Postgres. No AI/ML.

- `frontend/` React + Vite (deployed on Vercel)
- `backend/` Spring Boot 3 REST API, validates Supabase JWTs (deployed on Render via Docker)
- `supabase/migrations/` schema, signup trigger, demo seed data

## Roles
`profiles.role` is `student` (default on signup) or `admin`. The backend reads the role from the DB on every request, never from the JWT. Promote an admin with SQL:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## API
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/session | any user (records login) |
| GET | /api/me | any user |
| GET | /api/student/dashboard | student |
| GET | /api/admin/students | admin |
| GET | /api/admin/students/{id} | admin |

## Config
Backend (Render): `SUPABASE_URL`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `ALLOWED_ORIGIN` (comma-separated frontend origins).
Frontend (Vercel): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.

## Local
```
cd backend && mvn spring-boot:run     # needs the env vars above
cd frontend && cp .env.example .env.local && npm install && npm run dev
```
