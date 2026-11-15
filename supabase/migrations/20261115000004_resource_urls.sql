alter table public.resources add column url text;
update public.resources r set url = v.url from (values
 ('Data Structures Crash Course','https://www.geeksforgeeks.org/data-structures/'),
 ('Algorithm Patterns Practice Set','https://leetcode.com/problem-list/top-interview-questions/'),
 ('System Design Primer','https://github.com/donnemartin/system-design-primer'),
 ('SQL Joins Workshop','https://www.w3schools.com/sql/sql_join.asp'),
 ('Java OOP Deep Dive','https://docs.oracle.com/javase/tutorial/java/concepts/'),
 ('Spring Boot REST in 90 Minutes','https://spring.io/guides/gs/rest-service'),
 ('REST API Design Basics','https://restfulapi.net/'),
 ('React Fundamentals','https://react.dev/learn'),
 ('Git for Teams','https://git-scm.com/book/en/v2'),
 ('Unit Testing with JUnit','https://junit.org/junit5/docs/current/user-guide/'),
 ('Python for Data Analysis','https://pandas.pydata.org/docs/getting_started/intro_tutorials/'),
 ('DBMS Normalisation Notes','https://www.geeksforgeeks.org/normal-forms-in-dbms/'),
 ('Operating Systems Interview Questions','https://www.geeksforgeeks.org/operating-systems/'),
 ('Networking Basics: TCP/IP','https://www.geeksforgeeks.org/tcp-ip-model/'),
 ('Cloud Fundamentals','https://aws.amazon.com/getting-started/cloud-essentials/'),
 ('Java Collections Practice','https://docs.oracle.com/javase/tutorial/collections/')
) as v(title, url) where r.title = v.title;
alter table public.resources alter column url set not null;
