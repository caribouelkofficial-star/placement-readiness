# PlaceReady: Placement Readiness

A student placement-readiness web app. **Only login and logout are real** (Supabase Auth). Everything else is mock data: the
Spring Boot API generates a different, stable set of dashboards for each student from what they enter during onboarding, plus
reference tables (career roles, learning resources) stored in Postgres. No AI/ML.

- `frontend/` React + Vite, deployed on Vercel
- `backend/` Spring Boot 3 REST API (validates Supabase JWTs), deployed on Render via Docker
- `supabase/migrations/` schema, triggers, reference data

## How it works
1. **Sign up / log in** with Supabase Auth (email + password). A database trigger creates a `profiles` row (role `student`).
2. **Onboarding (students, first login):** a 3-step form collects college, degree, branch, CGPA, 10th/12th %, skills, coding level,
   practice hours, projects, internships, certifications, self-ratings and a target role. The backend derives aptitude, coding and
   communication scores and the overall readiness score (CGPA 25%, aptitude 25%, coding 35%, communication 15%), and saves the answers.
   Students can edit them later from Settings.
3. **Student dashboards** (all served by `/api/student/*`): Overview, Profile, Skills, Aptitude, Coding, Readiness, Careers,
   Skill gaps, Roadmap, Progress, Resources, Settings. Each reflects the student's own onboarding answers, so no two look the same.
   Buttons without a real backend (starting tests, saving preferences) open a "Coming soon" page.
4. **Admin (placement officer)** sees only real signups (seeded demo students are hidden): overview stats, the student list
   (students who haven't finished onboarding show as "Onboarding pending"), each student's full set of dashboards, career roles and resources.

## Roles
`profiles.role` is `student` (default) or `admin`. The backend reads the role from the database on every request and never trusts the JWT for it.
The frontend guards are only for UX. Promote an admin with SQL after they sign up:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## API
All routes need `Authorization: Bearer <supabase access token>` except the health check.

| Method | Path | Access |
|---|---|---|
| GET | /actuator/health | public |
| POST | /api/auth/session | any user (records a login event) |
| GET | /api/me | any user (profile, role, `onboarded`) |
| GET | /api/roles, /api/resources | any user |
| GET / POST | /api/student/onboarding | student (read / save onboarding answers) |
| GET | /api/student/{overview,profile,skills,aptitude,coding,readiness,careers,skill-gaps,roadmap,progress} | student (409 until onboarded) |
| GET | /api/admin/overview, /api/admin/students, /api/admin/roles | admin |
| GET | /api/admin/students/{id}/{section} | admin (same sections as above) |

## Database (Supabase Postgres)
Tables: `profiles`, `student_academics`, `readiness_scores`, `login_events`, `student_onboarding`, `career_roles`, `resources`.
Row-level security is on with no policies, so the public Data API exposes nothing. The backend connects as a least-privilege role,
`app_backend` (see `20261115000002_backend_role.sql`; set its password out-of-band, never in git). Apply the files in
`supabase/migrations/` in order.

## Config
Backend (Render): `SUPABASE_URL`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `ALLOWED_ORIGIN` (comma-separated frontend origins).
Use Supabase's session pooler for `DB_URL`. Render's free tier sleeps after about 15 minutes idle, so the first request can take 30–60 seconds.
Frontend (Vercel): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable key only), `VITE_API_URL` (the Render URL).
In Supabase Auth settings, add the Vercel URL as the Site URL and turn "Confirm email" off if you don't want email confirmation.

## Local development
```
cd backend && mvn spring-boot:run          # Java 17; needs the backend env vars above
cd backend && mvn test                      # security and mock-data tests
cd frontend && cp .env.example .env.local && npm install && npm run dev
```
