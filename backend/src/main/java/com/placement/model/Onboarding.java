package com.placement.model;

import java.util.List;
import java.util.Set;

/** What a student tells us after signing up. Dashboards are derived from this. */
public record Onboarding(String fullName, String college, String degree, String branch, int graduationYear, String location,
                         double cgpa, int tenthPct, int twelfthPct, int backlogs, List<String> skills, String experienceLevel,
                         int practiceHoursPerWeek, int problemsSolved, int projects, int internships, String certifications,
                         int aptitudeRating, int communicationRating, String targetRole, String bio) {

    public static final Set<String> SKILLS = Set.of("Java", "SQL", "Python", "React", "Data Structures", "Algorithms",
            "System Design", "REST APIs", "Git", "DBMS", "Operating Systems", "Computer Networks", "OOP", "Spring Boot",
            "Testing", "Cloud Basics");
    public static final Set<String> LEVELS = Set.of("Beginner", "Intermediate", "Advanced");

    /** Scores derived from the form. Same weights as public.mock_readiness: CGPA 25%, aptitude 25%, coding 35%, communication 15%. */
    public record Scores(int aptitude, int coding, int communication, int readiness, String level,
                         List<String> recommendedSkills, List<String> recommendedCareers) {}

    private static int clamp(double v) { return (int) Math.max(5, Math.min(98, Math.round(v))); }

    public Scores scores() {
        double levelBonus = switch (experienceLevel) { case "Advanced" -> 18; case "Intermediate" -> 9; default -> 0; };
        int coding = clamp(22 + levelBonus + Math.min(skills.size(), 8) * 2.5 + Math.min(practiceHoursPerWeek, 15) * 1.1
                + Math.min(problemsSolved, 300) / 300.0 * 18 + Math.min(projects, 5) * 2 - Math.min(backlogs, 5) * 1.5);
        int aptitude = clamp(15 + aptitudeRating * 8 + (tenthPct + twelfthPct) / 2.0 * 0.25 + cgpa * 2.5);
        int comm = clamp(30 + communicationRating * 9 + Math.min(internships, 3) * 4 + (certifications != null && !certifications.isBlank() ? 3 : 0));
        int score = (int) Math.round(cgpa * 10 * 0.25 + aptitude * 0.25 + coding * 0.35 + comm * 0.15);
        String level = score >= 80 ? "Placement Ready" : score >= 65 ? "Ready" : score >= 50 ? "Developing" : "Beginner";
        var recSkills = coding < 60 ? List.of("Data Structures", "Algorithms", "Problem Solving") : List.of("System Design", "SQL", "Mock Interviews");
        var careers = coding >= 70 ? List.of("Software Engineer", "Backend Developer")
                : aptitude >= 70 ? List.of("Data Analyst", "Business Analyst") : List.of("QA Engineer", "Support Engineer");
        return new Scores(aptitude, coding, comm, score, level, recSkills, careers);
    }

    /** Returns an error message, or null when valid. */
    public String validate(Set<String> roleTitles) {
        if (fullName == null || fullName.isBlank() || fullName.length() > 80) return "Enter your full name";
        if (college == null || college.isBlank() || college.length() > 100) return "Enter your college";
        if (degree == null || degree.isBlank() || degree.length() > 40) return "Select your degree";
        if (branch == null || branch.isBlank() || branch.length() > 40) return "Select your branch";
        if (location == null || location.isBlank() || location.length() > 60) return "Enter your city";
        if (graduationYear < 2024 || graduationYear > 2031) return "Graduation year is out of range";
        if (cgpa < 0 || cgpa > 10) return "CGPA must be between 0 and 10";
        if (tenthPct < 0 || tenthPct > 100 || twelfthPct < 0 || twelfthPct > 100) return "Percentages must be between 0 and 100";
        if (backlogs < 0 || backlogs > 30) return "Backlogs must be between 0 and 30";
        if (skills == null || skills.isEmpty() || !SKILLS.containsAll(skills)) return "Pick at least one skill from the list";
        if (experienceLevel == null || !LEVELS.contains(experienceLevel)) return "Select your experience level";
        if (practiceHoursPerWeek < 0 || practiceHoursPerWeek > 60) return "Practice hours must be between 0 and 60";
        if (problemsSolved < 0 || problemsSolved > 5000) return "Problems solved must be between 0 and 5000";
        if (projects < 0 || projects > 30 || internships < 0 || internships > 10) return "Projects or internships out of range";
        if (aptitudeRating < 1 || aptitudeRating > 5 || communicationRating < 1 || communicationRating > 5) return "Ratings must be 1 to 5";
        if (targetRole == null || !roleTitles.contains(targetRole)) return "Select a target role";
        if (certifications != null && certifications.length() > 300) return "Certifications text is too long";
        if (bio != null && bio.length() > 500) return "Bio is too long";
        return null;
    }
}
