-- Mock reference data served by the API: career roles (with required skill levels) and learning resources.
create table public.career_roles (
  slug        text primary key,
  title       text not null,
  description text not null,
  salary      text not null,
  required    jsonb not null  -- { "Skill": requiredLevel 0-100 }
);
create table public.resources (
  id       int generated always as identity primary key,
  title    text not null,
  type     text not null check (type in ('Course', 'Practice', 'Article', 'Video')),
  skill    text not null,
  duration text not null
);
alter table public.career_roles enable row level security;
alter table public.resources    enable row level security;
grant select on public.career_roles, public.resources to app_backend;

insert into public.career_roles values
 ('software-engineer','Software Engineer','Design, build and ship software features across the stack.','₹6–18 LPA','{"Data Structures":70,"Algorithms":70,"OOP":65,"Git":60,"System Design":50,"Testing":50}'),
 ('backend-developer','Backend Developer','Build APIs, services and data layers that power products.','₹6–16 LPA','{"Java":70,"Spring Boot":60,"SQL":70,"REST APIs":70,"DBMS":60,"System Design":50}'),
 ('frontend-developer','Frontend Developer','Create fast, accessible user interfaces for the web.','₹5–15 LPA','{"React":70,"Git":55,"REST APIs":55,"Testing":45,"OOP":40}'),
 ('data-analyst','Data Analyst','Turn raw data into insights with SQL, Python and dashboards.','₹4–12 LPA','{"SQL":75,"Python":65,"DBMS":55,"Algorithms":40}'),
 ('qa-engineer','QA Engineer','Own product quality through test design and automation.','₹4–10 LPA','{"Testing":70,"SQL":55,"REST APIs":55,"Git":45,"OOP":40}'),
 ('devops-engineer','DevOps Engineer','Automate builds, deployments and infrastructure.','₹6–18 LPA','{"Cloud Basics":65,"Operating Systems":65,"Computer Networks":60,"Git":60,"Python":50}'),
 ('business-analyst','Business Analyst','Bridge business needs and technical delivery.','₹4–11 LPA','{"SQL":60,"Data Structures":30,"REST APIs":40,"Python":40}'),
 ('support-engineer','Support Engineer','Diagnose and resolve customer-facing technical issues.','₹3–8 LPA','{"SQL":50,"Operating Systems":50,"Computer Networks":50,"Testing":35}');

insert into public.resources (title, type, skill, duration) values
 ('Data Structures Crash Course','Course','Data Structures','6 hrs'),
 ('Algorithm Patterns Practice Set','Practice','Algorithms','20 problems'),
 ('System Design Primer','Article','System Design','2 hrs'),
 ('SQL Joins Workshop','Course','SQL','3 hrs'),
 ('Java OOP Deep Dive','Video','OOP','4 hrs'),
 ('Spring Boot REST in 90 Minutes','Video','Spring Boot','1.5 hrs'),
 ('REST API Design Basics','Article','REST APIs','45 min'),
 ('React Fundamentals','Course','React','8 hrs'),
 ('Git for Teams','Video','Git','1 hr'),
 ('Unit Testing with JUnit','Course','Testing','2 hrs'),
 ('Python for Data Analysis','Course','Python','10 hrs'),
 ('DBMS Normalisation Notes','Article','DBMS','1 hr'),
 ('Operating Systems Interview Questions','Practice','Operating Systems','50 questions'),
 ('Networking Basics: TCP/IP','Video','Computer Networks','2 hrs'),
 ('Cloud Fundamentals','Course','Cloud Basics','5 hrs'),
 ('Java Collections Practice','Practice','Java','15 problems');
