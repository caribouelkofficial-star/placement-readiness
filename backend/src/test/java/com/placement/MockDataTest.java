package com.placement;

import static org.junit.jupiter.api.Assertions.*;

import com.placement.model.Dtos.*;
import com.placement.model.MockData;
import com.placement.model.Onboarding;
import com.placement.model.Repo.Resource;
import com.placement.model.Repo.Role;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MockDataTest {
    final MockData mock = new MockData();
    final List<Role> roles = List.of(
            new Role("a", "Alpha", "d", "s", Map.of("Java", 70, "SQL", 60)),
            new Role("b", "Beta", "d", "s", Map.of("React", 70, "Git", 50)));
    final List<Resource> res = List.of(new Resource(1, "R", "Course", "Java", "1h", "https://example.org"));

    StudentDashboard student(UUID id, int coding) {
        return new StudentDashboard(new Profile(id, "S", "s@x.com", "student", "CSE", "+91 9876543210", true),
                new Academics(7.5, 70, coding, 70, List.of("Java")), new Readiness(70, "Ready", List.of(), List.of()));
    }

    @Test void sameStudentIsStable() {
        var d = student(UUID.fromString("00000000-0000-0000-0000-000000000001"), 70);
        assertEquals(mock.section("profile", d, roles, res, null).toString(), mock.section("profile", d, roles, res, null).toString());
    }

    @Test void differentStudentsDiffer() {
        var a = student(UUID.randomUUID(), 90);
        var b = student(UUID.randomUUID(), 40);
        assertNotEquals(mock.section("profile", a, roles, res, null).toString(), mock.section("profile", b, roles, res, null).toString());
        assertNotEquals(mock.section("skills", a, roles, res, null).toString(), mock.section("skills", b, roles, res, null).toString());
    }

    @Test void everySectionRenders() {
        var d = student(UUID.randomUUID(), 60);
        for (String s : List.of("overview", "profile", "skills", "aptitude", "coding", "readiness", "careers", "skill-gaps", "roadmap", "progress"))
            assertNotNull(mock.section(s, d, roles, res, null), s);
        assertNull(mock.section("nope", d, roles, res, null));
    }

    static Onboarding form(String targetRole, String level, int hours, double cgpa) {
        return new Onboarding("Test User", "Some College", "B.Tech", "CSE", 2027, "Pune", cgpa, 85, 80, 0,
                List.of("Java", "SQL"), level, hours, 120, 3, 1, "AWS Cloud Practitioner", 4, 3, targetRole, null);
    }

    @Test void onboardingDrivesTheDashboard() {
        var d = student(UUID.randomUUID(), 70);
        var strong = form("Alpha", "Advanced", 12, 9.0);
        var weak = form("Beta", "Beginner", 1, 6.0);
        assertTrue(strong.scores().readiness() > weak.scores().readiness());
        var profile = mock.section("profile", d, roles, res, strong).toString();
        assertTrue(profile.contains("Some College") && profile.contains("Pune") && profile.contains("AWS Cloud Practitioner"));
        assertTrue(mock.section("skill-gaps", d, roles, res, strong).toString().contains("targetRole=Alpha"));
        assertTrue(mock.section("skill-gaps", d, roles, res, weak).toString().contains("targetRole=Beta"));
    }

    @Test void onboardingValidation() {
        var titles = java.util.Set.of("Alpha");
        assertNull(form("Alpha", "Advanced", 5, 8).validate(titles));
        assertNotNull(form("Nope", "Advanced", 5, 8).validate(titles));
        assertNotNull(form("Alpha", "Advanced", 5, 11).validate(titles));
        assertNotNull(form("Alpha", "Wizard", 5, 8).validate(titles));
    }
}
