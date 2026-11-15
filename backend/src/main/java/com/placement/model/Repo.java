package com.placement.model;

import com.placement.model.Dtos.*;
import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class Repo {
    private final JdbcTemplate jdbc;

    public Repo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static List<String> strings(ResultSet rs, String col) throws SQLException {
        Array a = rs.getArray(col);
        return a == null ? List.of() : Arrays.asList((String[]) a.getArray());
    }

    private static Profile profile(ResultSet rs) throws SQLException {
        return new Profile(rs.getObject("id", UUID.class), rs.getString("full_name"), rs.getString("email"),
                rs.getString("role"), rs.getString("branch"), rs.getString("phone"), rs.getBoolean("onboarded"));
    }

    public Optional<Profile> profileByAuthUser(UUID authUserId) {
        return jdbc.query("select id, full_name, email, role, branch, phone, onboarded from public.profiles where auth_user_id = ?",
                (rs, i) -> profile(rs), authUserId).stream().findFirst();
    }

    public void recordLogin(UUID authUserId) {
        jdbc.update("update public.profiles set last_login_at = now() where auth_user_id = ?", authUserId);
        jdbc.update("insert into public.login_events (profile_id) select id from public.profiles where auth_user_id = ?",
                authUserId);
    }

    public Optional<StudentDashboard> dashboard(UUID profileId) {
        return jdbc.query("""
                select p.id, p.full_name, p.email, p.role, p.branch, p.phone, p.onboarded,
                       a.cgpa, a.aptitude_score, a.coding_score, a.communication_score, a.skills,
                       r.score, r.level, r.recommended_skills, r.recommended_careers
                from public.profiles p
                join public.student_academics a on a.profile_id = p.id
                join public.readiness_scores r on r.profile_id = p.id
                where p.id = ?""", (rs, i) -> new StudentDashboard(profile(rs),
                new Academics(rs.getDouble("cgpa"), rs.getInt("aptitude_score"), rs.getInt("coding_score"),
                        rs.getInt("communication_score"), strings(rs, "skills")),
                new Readiness(rs.getInt("score"), rs.getString("level"), strings(rs, "recommended_skills"),
                        strings(rs, "recommended_careers"))), profileId).stream().findFirst();
    }

    public List<OffsetDateTime> recentLogins(UUID profileId) {
        return jdbc.query("select logged_in_at from public.login_events where profile_id = ? order by logged_in_at desc limit 10",
                (rs, i) -> rs.getObject("logged_in_at", OffsetDateTime.class), profileId);
    }

    public List<StudentSummary> students() {
        return jdbc.query("""
                select p.id, p.full_name, p.email, p.branch, p.last_login_at,
                       (select count(*) from public.login_events e where e.profile_id = p.id) as logins,
                       r.score, r.level, p.onboarded
                from public.profiles p
                join public.readiness_scores r on r.profile_id = p.id
                where p.role = 'student' and p.auth_user_id is not null
                order by p.last_login_at desc nulls last""",
                (rs, i) -> new StudentSummary(rs.getObject("id", UUID.class), rs.getString("full_name"),
                        rs.getString("email"), rs.getString("branch"),
                        rs.getObject("last_login_at", OffsetDateTime.class), rs.getInt("logins"),
                        rs.getInt("score"), rs.getString("level"), rs.getBoolean("onboarded")));
    }

    public record Role(String slug, String title, String description, String salary, java.util.Map<String, Integer> required) {}
    public record Resource(int id, String title, String type, String skill, String duration, String url) {}

    private final com.fasterxml.jackson.databind.ObjectMapper json = new com.fasterxml.jackson.databind.ObjectMapper();

    public List<Role> roles() {
        return jdbc.query("select slug, title, description, salary, required::text as required from public.career_roles order by title",
                (rs, i) -> {
                    try {
                        java.util.Map<String, Integer> req = json.readValue(rs.getString("required"),
                                new com.fasterxml.jackson.core.type.TypeReference<>() {});
                        return new Role(rs.getString("slug"), rs.getString("title"), rs.getString("description"),
                                rs.getString("salary"), req);
                    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                        throw new SQLException(e);
                    }
                });
    }

    public List<Resource> resources() {
        return jdbc.query("select id, title, type, skill, duration, url from public.resources order by id",
                (rs, i) -> new Resource(rs.getInt("id"), rs.getString("title"), rs.getString("type"),
                        rs.getString("skill"), rs.getString("duration"), rs.getString("url")));
    }

    public java.util.Map<String, Object> adminStats() {
        var m = new java.util.LinkedHashMap<String, Object>();
        m.put("totalStudents", jdbc.queryForObject("select count(*) from public.profiles where role = 'student' and auth_user_id is not null", Integer.class));
        m.put("averageScore", jdbc.queryForObject(
                "select coalesce(round(avg(r.score)), 0) from public.readiness_scores r join public.profiles p on p.id = r.profile_id where p.role = 'student' and p.auth_user_id is not null and p.onboarded", Integer.class));
        m.put("activeLast7Days", jdbc.queryForObject(
                "select count(*) from public.profiles where role = 'student' and auth_user_id is not null and last_login_at > now() - interval '7 days'", Integer.class));
        m.put("levels", jdbc.query("select r.level, count(*) c from public.readiness_scores r join public.profiles p on p.id = r.profile_id where p.role = 'student' and p.auth_user_id is not null and p.onboarded group by r.level",
                (rs, i) -> java.util.Map.of("level", rs.getString("level"), "count", rs.getInt("c"))));
        m.put("branches", jdbc.query("""
                select coalesce(p.branch, 'Unassigned') b, count(*) c, round(avg(r.score)) a
                from public.profiles p join public.readiness_scores r on r.profile_id = p.id
                where p.role = 'student' and p.auth_user_id is not null and p.onboarded group by 1 order by 2 desc""",
                (rs, i) -> java.util.Map.of("branch", rs.getString("b"), "count", rs.getInt("c"), "averageScore", rs.getInt("a"))));
        m.put("recentLogins", jdbc.query("""
                select p.id, p.full_name, e.logged_in_at from public.login_events e join public.profiles p on p.id = e.profile_id
                where p.auth_user_id is not null
                order by e.logged_in_at desc limit 8""",
                (rs, i) -> java.util.Map.of("id", rs.getObject("id", UUID.class), "fullName", rs.getString("full_name"),
                        "at", rs.getObject("logged_in_at", OffsetDateTime.class))));
        return m;
    }

    public void recordPasswordChange(UUID profileId) {
        jdbc.update("insert into public.password_events (profile_id) values (?)", profileId);
    }

    public Optional<Onboarding> onboarding(UUID profileId) {
        return jdbc.query("select data::text from public.student_onboarding where profile_id = ?", (rs, i) -> {
            try {
                return json.readValue(rs.getString(1), Onboarding.class);
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                throw new SQLException(e);
            }
        }, profileId).stream().findFirst();
    }

    @org.springframework.transaction.annotation.Transactional
    public void saveOnboarding(UUID profileId, Onboarding o, Onboarding.Scores s) {
        String data;
        try {
            data = json.writeValueAsString(o);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
        jdbc.update("update public.profiles set full_name = ?, branch = ?, onboarded = true where id = ?",
                o.fullName().trim(), o.branch(), profileId);
        jdbc.update("""
                insert into public.student_onboarding (profile_id, data) values (?, ?::jsonb)
                on conflict (profile_id) do update set data = excluded.data, updated_at = now()""", profileId, data);
        jdbc.update(con -> {
            var ps = con.prepareStatement("""
                    insert into public.student_academics (profile_id, cgpa, aptitude_score, coding_score, communication_score, skills)
                    values (?, ?, ?, ?, ?, ?)
                    on conflict (profile_id) do update set cgpa = excluded.cgpa, aptitude_score = excluded.aptitude_score,
                      coding_score = excluded.coding_score, communication_score = excluded.communication_score, skills = excluded.skills""");
            ps.setObject(1, profileId);
            ps.setBigDecimal(2, java.math.BigDecimal.valueOf(o.cgpa()).setScale(2, java.math.RoundingMode.HALF_UP));
            ps.setInt(3, s.aptitude());
            ps.setInt(4, s.coding());
            ps.setInt(5, s.communication());
            ps.setArray(6, con.createArrayOf("text", o.skills().toArray()));
            return ps;
        });
        jdbc.update(con -> {
            var ps = con.prepareStatement("""
                    insert into public.readiness_scores (profile_id, score, level, recommended_skills, recommended_careers)
                    values (?, ?, ?, ?, ?)
                    on conflict (profile_id) do update set score = excluded.score, level = excluded.level,
                      recommended_skills = excluded.recommended_skills, recommended_careers = excluded.recommended_careers""");
            ps.setObject(1, profileId);
            ps.setInt(2, s.readiness());
            ps.setString(3, s.level());
            ps.setArray(4, con.createArrayOf("text", s.recommendedSkills().toArray()));
            ps.setArray(5, con.createArrayOf("text", s.recommendedCareers().toArray()));
            return ps;
        });
    }
}
