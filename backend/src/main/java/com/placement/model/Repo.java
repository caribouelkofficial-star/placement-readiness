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
                rs.getString("role"), rs.getString("branch"));
    }

    public Optional<Profile> profileByAuthUser(UUID authUserId) {
        return jdbc.query("select id, full_name, email, role, branch from public.profiles where auth_user_id = ?",
                (rs, i) -> profile(rs), authUserId).stream().findFirst();
    }

    public void recordLogin(UUID authUserId) {
        jdbc.update("update public.profiles set last_login_at = now() where auth_user_id = ?", authUserId);
        jdbc.update("insert into public.login_events (profile_id) select id from public.profiles where auth_user_id = ?",
                authUserId);
    }

    public Optional<StudentDashboard> dashboard(UUID profileId) {
        return jdbc.query("""
                select p.id, p.full_name, p.email, p.role, p.branch,
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
                       r.score, r.level
                from public.profiles p
                join public.readiness_scores r on r.profile_id = p.id
                where p.role = 'student'
                order by p.last_login_at desc nulls last""",
                (rs, i) -> new StudentSummary(rs.getObject("id", UUID.class), rs.getString("full_name"),
                        rs.getString("email"), rs.getString("branch"),
                        rs.getObject("last_login_at", OffsetDateTime.class), rs.getInt("logins"),
                        rs.getInt("score"), rs.getString("level")));
    }
}
