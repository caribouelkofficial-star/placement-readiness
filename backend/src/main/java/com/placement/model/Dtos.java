package com.placement.model;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class Dtos {
    private Dtos() {}

    public record PasswordChange(String currentPassword, String newPassword) {}
    public record Profile(UUID id, String fullName, String email, String role, String branch, String phone, boolean onboarded) {}
    public record Academics(double cgpa, int aptitudeScore, int codingScore, int communicationScore, List<String> skills) {}
    public record Readiness(int score, String level, List<String> recommendedSkills, List<String> recommendedCareers) {}
    public record StudentDashboard(Profile profile, Academics academics, Readiness readiness) {}
    public record StudentDetail(Profile profile, Academics academics, Readiness readiness, List<OffsetDateTime> recentLogins) {}
    public record StudentSummary(UUID id, String fullName, String email, String branch,
                                 OffsetDateTime lastLoginAt, int loginCount, int score, String level, boolean onboarded) {}
}
