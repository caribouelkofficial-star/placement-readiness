package com.placement.model;

import com.placement.model.Dtos.StudentDashboard;
import com.placement.model.Repo.Resource;
import com.placement.model.Repo.Role;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Mock data generator. Everything except login/logout is simulated: each student gets a stable,
 * different set of details derived from their id and academic numbers (no ML, no persistence).
 */
@Service
public class MockData {
    private static final String[] SKILLS = {"Java", "SQL", "Python", "React", "Data Structures", "Algorithms",
            "System Design", "REST APIs", "Git", "DBMS", "Operating Systems", "Computer Networks", "OOP",
            "Spring Boot", "Testing", "Cloud Basics"};
    private static final String[] COLLEGES = {"National Institute of Technology", "Greenfield College of Engineering",
            "Sunrise Institute of Technology", "Meridian University", "Lakeview Engineering College", "Pioneer Institute of Technology"};
    private static final String[] CITIES = {"Pune", "Bengaluru", "Hyderabad", "Chennai", "Jaipur", "Kolkata", "Indore", "Nagpur"};
    private static final String[] PROJECT_NAMES = {"Campus Event Manager", "Expense Tracker", "Library Management System",
            "Chat Application", "Weather Dashboard", "Student Attendance Portal", "Online Quiz Platform", "Blog CMS"};
    private static final String[] PROJECT_TECH = {"Java, Spring Boot, MySQL", "React, Node.js", "Python, Flask, SQLite",
            "React, Firebase", "Java, JDBC", "Python, Pandas", "React, REST APIs", "Spring Boot, PostgreSQL"};
    private static final String[] CERTS = {"Oracle Java SE Associate", "AWS Cloud Practitioner", "HackerRank SQL (Intermediate)",
            "Google Data Analytics (in progress)", "NPTEL: Data Structures", "Coursera: Python for Everybody"};
    private static final String[][] PROBLEMS = {{"Two Sum", "Easy", "Arrays", "https://leetcode.com/problems/two-sum/"}, {"Valid Parentheses", "Easy", "Stacks", "https://leetcode.com/problems/valid-parentheses/"},
            {"Merge Intervals", "Medium", "Arrays", "https://leetcode.com/problems/merge-intervals/"}, {"LRU Cache", "Medium", "Design", "https://leetcode.com/problems/lru-cache/"}, {"Binary Tree Level Order", "Medium", "Trees", "https://leetcode.com/problems/binary-tree-level-order-traversal/"},
            {"Longest Substring Without Repeating", "Medium", "Strings", "https://leetcode.com/problems/longest-substring-without-repeating-characters/"}, {"Course Schedule", "Medium", "Graphs", "https://leetcode.com/problems/course-schedule/"},
            {"Coin Change", "Medium", "DP", "https://leetcode.com/problems/coin-change/"}, {"Word Ladder", "Hard", "Graphs", "https://leetcode.com/problems/word-ladder/"}, {"Median of Two Sorted Arrays", "Hard", "Binary Search", "https://leetcode.com/problems/median-of-two-sorted-arrays/"}};

    private static Random rnd(Dtos.Profile p, long salt) {
        return new Random(p.id().getMostSignificantBits() ^ (p.id().getLeastSignificantBits() * 31) ^ (salt * 0x9E3779B97F4A7C15L));
    }

    private static int clamp(double v) { return (int) Math.max(5, Math.min(99, Math.round(v))); }

    private static <T> T pick(Random r, T[] a) { return a[r.nextInt(a.length)]; }

    /** Student skill levels (0-100), stable per student. */
    /** The signed-in student's onboarding answers for the request being served (null for seeded demo students). */
    private final ThreadLocal<Onboarding> ob = new ThreadLocal<>();

    private Map<String, Integer> skillLevels(StudentDashboard d) {
        var p = d.profile(); var a = d.academics(); var r = rnd(p, 1);
        var o = ob.get();
        if (o != null) {
            double bonus = switch (o.experienceLevel()) { case "Advanced" -> 8; case "Intermediate" -> 0; default -> -6; };
            var m = new LinkedHashMap<String, Integer>();
            for (String s : SKILLS) {
                double base = o.skills().contains(s) ? a.codingScore() + bonus + 6 + r.nextGaussian() * 6
                        : a.codingScore() - 28 + r.nextGaussian() * 8;
                m.put(s, clamp(base));
            }
            return m;
        }
        double tech = a.codingScore() * 0.65 + a.cgpa() * 10 * 0.35;
        var m = new LinkedHashMap<String, Integer>();
        for (String s : SKILLS) {
            double base = tech + (r.nextGaussian() * 11) - 8;
            if (a.skills().contains(s)) base += 14;
            m.put(s, clamp(base));
        }
        return m;
    }

    private List<Map<String, Object>> matches(StudentDashboard d, List<Role> roles) {
        var levels = skillLevels(d);
        var out = new ArrayList<Map<String, Object>>();
        for (Role role : roles) {
            double sum = 0; var have = new ArrayList<String>(); var miss = new ArrayList<String>();
            for (var e : role.required().entrySet()) {
                int lv = levels.getOrDefault(e.getKey(), 0);
                double need = e.getValue(), ratio = lv / need;
                // Fully meeting a requirement earns 90%; the last 10% rewards headroom. Shortfalls are penalised quadratically.
                sum += ratio >= 1 ? 0.9 + 0.1 * Math.min(1.0, (lv - need) / Math.max(1.0, 100 - need)) : 0.9 * ratio * ratio;
                (lv >= e.getValue() ? have : miss).add(e.getKey());
            }
            var m = new LinkedHashMap<String, Object>();
            m.put("slug", role.slug()); m.put("title", role.title()); m.put("description", role.description());
            m.put("salary", role.salary()); m.put("match", clamp(sum / role.required().size() * 100));
            m.put("matchedSkills", have); m.put("missingSkills", miss);
            out.add(m);
        }
        out.sort((x, y) -> (int) y.get("match") - (int) x.get("match"));
        return out;
    }

    /** The role the student chose during onboarding, otherwise their best match. */
    private Map<String, Object> target(List<Map<String, Object>> ms) {
        var o = ob.get();
        if (o != null) for (var m : ms) if (m.get("title").equals(o.targetRole())) return m;
        return ms.get(0);
    }

    public Object section(String name, StudentDashboard d, List<Role> roles, List<Resource> resources, Onboarding onboarding) {
        ob.set(onboarding);
        try {
            return section(name, d, roles, resources);
        } finally {
            ob.remove();
        }
    }

    private Object section(String name, StudentDashboard d, List<Role> roles, List<Resource> resources) {
        return switch (name) {
            case "overview" -> overview(d, roles);
            case "profile" -> profile(d);
            case "skills" -> skills(d);
            case "aptitude" -> aptitude(d);
            case "coding" -> coding(d);
            case "readiness" -> readiness(d);
            case "careers" -> matches(d, roles);
            case "skill-gaps" -> gaps(d, roles, resources);
            case "roadmap" -> roadmap(d, roles);
            case "progress" -> progress(d);
            default -> null;
        };
    }

    private Object overview(StudentDashboard d, List<Role> roles) {
        var a = d.academics(); var p = d.profile(); var r = rnd(p, 2);
        var comps = List.of(
                Map.of("label", "Academic Performance", "value", clamp(a.cgpa() * 10), "weight", 25),
                Map.of("label", "Aptitude", "value", a.aptitudeScore(), "weight", 25),
                Map.of("label", "Coding Performance", "value", a.codingScore(), "weight", 35),
                Map.of("label", "Communication & Soft Skills", "value", a.communicationScore(), "weight", 15));
        var activity = new ArrayList<Map<String, Object>>();
        String[] acts = {"Completed aptitude practice set", "Solved %s on coding practice", "Updated profile skills",
                "Viewed career recommendations", "Finished mock interview round"};
        for (int i = 0; i < 4; i++) {
            String t = acts[(i + r.nextInt(acts.length)) % acts.length];
            activity.add(Map.of("text", t.contains("%s") ? t.formatted(PROBLEMS[r.nextInt(PROBLEMS.length)][0]) : t,
                    "date", LocalDate.now().minusDays(i * 2L + r.nextInt(2)).toString()));
        }
        var m = new LinkedHashMap<String, Object>();
        m.put("profile", p); m.put("readiness", d.readiness()); m.put("competencies", comps);
        m.put("topCareers", matches(d, roles).stream().limit(3).toList());
        m.put("assessmentCoverage", 60 + r.nextInt(41));
        m.put("targetRole", target(matches(d, roles)).get("title"));
        var o = ob.get();
        m.put("stats", Map.of("testsTaken", 2 + r.nextInt(9),
                "problemsSolved", o != null ? o.problemsSolved() : Math.max(3, a.codingScore() / 3 + r.nextInt(10)),
                "streakDays", o != null ? Math.min(30, o.practiceHoursPerWeek() * 2 / 3 + r.nextInt(4)) : r.nextInt(15)));
        m.put("recentActivity", activity);
        return m;
    }

    private Object profile(StudentDashboard d) {
        var p = d.profile(); var a = d.academics(); var r = rnd(p, 3);
        int n = 2 + r.nextInt(2);
        var projects = new ArrayList<Map<String, String>>();
        var used = new HashSet<Integer>();
        while (projects.size() < n) {
            int i = r.nextInt(PROJECT_NAMES.length);
            if (used.add(i)) projects.add(Map.of("name", PROJECT_NAMES[i], "tech", PROJECT_TECH[r.nextInt(PROJECT_TECH.length)],
                    "summary", "Built as a " + (r.nextBoolean() ? "team" : "solo") + " project over " + (4 + r.nextInt(9)) + " weeks."));
        }
        var certs = new ArrayList<String>();
        for (int i = 0; i < r.nextInt(3) + (a.codingScore() > 70 ? 1 : 0); i++) certs.add(CERTS[(r.nextInt(CERTS.length) + i) % CERTS.length]);
        var o = ob.get();
        if (o != null) return onboardedProfile(p, a, o, r);
        var m = new LinkedHashMap<String, Object>();
        m.put("fullName", p.fullName()); m.put("email", p.email());
        m.put("branch", p.branch() != null ? p.branch() : pick(r, new String[]{"CSE", "IT", "ECE", "AI&DS"}));
        m.put("college", pick(r, COLLEGES)); m.put("degree", "B.Tech");
        m.put("graduationYear", 2027 + r.nextInt(2)); m.put("location", pick(r, CITIES));
        String fallbackPhone = "+91 9" + (100000000 + r.nextInt(899999999));
        m.put("phone", p.phone() != null && !p.phone().isBlank() ? p.phone() : fallbackPhone);
        m.put("cgpa", a.cgpa()); m.put("skills", a.skills());
        m.put("bio", "Final-year student interested in " + (a.codingScore() >= 70 ? "backend and systems engineering" : "building a strong foundation in software development") + ".");
        m.put("projects", projects); m.put("certifications", new LinkedHashSet<>(certs));
        return m;
    }

    private Object onboardedProfile(Dtos.Profile p, Dtos.Academics a, Onboarding o, Random r) {
        var projects = new ArrayList<Map<String, String>>();
        for (int i = 0; i < Math.min(o.projects(), 6); i++)
            projects.add(Map.of("name", PROJECT_NAMES[(i * 3 + Math.floorMod(p.id().hashCode(), 8)) % PROJECT_NAMES.length],
                    "tech", PROJECT_TECH[(i * 5 + Math.floorMod(p.id().hashCode(), 8)) % PROJECT_TECH.length],
                    "summary", "Built as a " + (i % 2 == 0 ? "team" : "solo") + " project over " + (4 + (i * 3) % 9) + " weeks."));
        var certs = new LinkedHashSet<String>();
        if (o.certifications() != null) for (String c : o.certifications().split("[,\n]")) if (!c.isBlank()) certs.add(c.trim());
        var m = new LinkedHashMap<String, Object>();
        m.put("fullName", p.fullName()); m.put("email", p.email()); m.put("phone", p.phone());
        m.put("branch", o.branch()); m.put("college", o.college()); m.put("degree", o.degree());
        m.put("graduationYear", o.graduationYear()); m.put("location", o.location());
        m.put("cgpa", o.cgpa()); m.put("skills", o.skills());
        m.put("bio", o.bio() != null && !o.bio().isBlank() ? o.bio() : "Aspiring " + o.targetRole() + " from " + o.college() + ".");
        m.put("projects", projects); m.put("certifications", certs);
        m.put("academicRecord", Map.of("tenthPct", o.tenthPct(), "twelfthPct", o.twelfthPct(), "backlogs", o.backlogs(),
                "internships", o.internships(), "experienceLevel", o.experienceLevel(), "targetRole", o.targetRole(),
                "practiceHoursPerWeek", o.practiceHoursPerWeek(), "problemsSolved", o.problemsSolved()));
        return m;
    }

    private Object skills(StudentDashboard d) {
        var levels = skillLevels(d);
        var cat = Map.ofEntries(Map.entry("Java", "Languages"), Map.entry("SQL", "Languages"), Map.entry("Python", "Languages"),
                Map.entry("React", "Frameworks"), Map.entry("Spring Boot", "Frameworks"), Map.entry("Data Structures", "Core CS"),
                Map.entry("Algorithms", "Core CS"), Map.entry("OOP", "Core CS"), Map.entry("DBMS", "Core CS"),
                Map.entry("Operating Systems", "Core CS"), Map.entry("Computer Networks", "Core CS"),
                Map.entry("System Design", "Engineering"), Map.entry("REST APIs", "Engineering"), Map.entry("Git", "Engineering"),
                Map.entry("Testing", "Engineering"), Map.entry("Cloud Basics", "Engineering"));
        return levels.entrySet().stream().map(e -> Map.of("name", e.getKey(), "level", e.getValue(),
                "category", cat.get(e.getKey()), "rating", e.getValue() >= 75 ? "Strong" : e.getValue() >= 55 ? "Proficient" : e.getValue() >= 40 ? "Developing" : "Beginner")).toList();
    }

    private Object aptitude(StudentDashboard d) {
        var a = d.academics(); var r = rnd(d.profile(), 4);
        String[] names = {"Quantitative", "Logical Reasoning", "Verbal Ability", "Data Interpretation"};
        var sections = new ArrayList<Map<String, Object>>();
        for (String n : names) {
            int score = clamp(a.aptitudeScore() + r.nextGaussian() * 9);
            sections.add(Map.of("name", n, "score", score, "questions", 20, "correct", Math.round(score / 5.0f)));
        }
        var attempts = new ArrayList<Map<String, Object>>();
        int n = 2 + r.nextInt(3);
        for (int i = n - 1; i >= 0; i--)
            attempts.add(Map.of("date", LocalDate.now().minusDays(i * 9L + 2).toString(),
                    "score", clamp(a.aptitudeScore() - i * 4 + r.nextInt(6)), "durationMin", 35 + r.nextInt(20)));
        return Map.of("overall", a.aptitudeScore(), "sections", sections, "attempts", attempts);
    }

    private Object coding(StudentDashboard d) {
        var a = d.academics(); var r = rnd(d.profile(), 5);
        var problems = new ArrayList<Map<String, Object>>();
        int solved = 0;
        for (int i = 0; i < PROBLEMS.length; i++) {
            var pr = PROBLEMS[i];
            double difficultyPenalty = pr[1].equals("Easy") ? 0 : pr[1].equals("Medium") ? 18 : 38;
            double chance = (a.codingScore() - difficultyPenalty) / 100.0 + r.nextDouble() * 0.3 - 0.1;
            String status = chance > 0.55 ? "Solved" : chance > 0.3 ? "Attempted" : "Not started";
            if (status.equals("Solved")) solved++;
            problems.add(Map.of("id", i + 1, "title", pr[0], "difficulty", pr[1], "topic", pr[2], "status", status, "url", pr[3]));
        }
        var langs = a.skills().stream().filter(s -> List.of("Java", "Python", "SQL").contains(s)).toList();
        return Map.of("score", a.codingScore(), "solved", solved, "total", PROBLEMS.length, "streakDays", r.nextInt(12),
                "languages", langs.isEmpty() ? List.of("Java") : langs, "problems", problems);
    }

    private Object readiness(StudentDashboard d) {
        var a = d.academics();
        double[][] f = {{a.cgpa() * 10, 0.25}, {a.aptitudeScore(), 0.25}, {a.codingScore(), 0.35}, {a.communicationScore(), 0.15}};
        String[] labels = {"Academics (CGPA × 10)", "Aptitude", "Coding", "Communication"};
        var rows = new ArrayList<Map<String, Object>>();
        for (int i = 0; i < 4; i++)
            rows.add(Map.of("label", labels[i], "value", Math.round(f[i][0]), "weight", Math.round(f[i][1] * 100),
                    "contribution", Math.round(f[i][0] * f[i][1] * 10) / 10.0));
        var weakest = rows.stream().min(Comparator.comparingLong(x -> (long) x.get("value"))).get();
        return Map.of("score", d.readiness().score(), "level", d.readiness().level(), "formula", rows,
                "insight", "Your biggest opportunity is " + weakest.get("label") + " (" + weakest.get("value") + "/100). Raising it by 10 points would add about "
                        + Math.round((long) weakest.get("weight") / 10.0 * 10) / 10.0 + " to your overall score.");
    }

    @SuppressWarnings("unchecked")
    private Object gaps(StudentDashboard d, List<Role> roles, List<Resource> resources) {
        var ms = matches(d, roles);
        var target = target(ms);
        var role = roles.stream().filter(x -> x.slug().equals(target.get("slug"))).findFirst().get();
        var levels = skillLevels(d);
        var gaps = new ArrayList<Map<String, Object>>();
        for (var e : role.required().entrySet()) {
            int cur = levels.getOrDefault(e.getKey(), 0);
            gaps.add(Map.of("skill", e.getKey(), "current", cur, "required", e.getValue(), "gap", Math.max(0, e.getValue() - cur)));
        }
        gaps.sort((x, y) -> (int) y.get("gap") - (int) x.get("gap"));
        var missing = gaps.stream().filter(g -> (int) g.get("gap") > 0).map(g -> (String) g.get("skill")).collect(Collectors.toSet());
        var recs = resources.stream().filter(x -> missing.contains(x.skill())).toList();
        return Map.of("targetRole", target.get("title"), "match", target.get("match"), "gaps", gaps, "resources", recs);
    }

    private Object roadmap(StudentDashboard d, List<Role> roles) {
        var r = rnd(d.profile(), 6);
        var weak = new ArrayList<>(skillLevels(d).entrySet());
        weak.sort(Map.Entry.comparingByValue());
        String s1 = weak.get(0).getKey(), s2 = weak.get(1).getKey(), s3 = weak.get(2).getKey();
        String role = (String) target(matches(d, roles)).get("title");
        record Ph(String name, String days, String focus, String[] tasks) {}
        var phases = List.of(
                new Ph("Foundation", "Days 1–30", "Close the biggest skill gaps",
                        new String[]{"Study " + s1 + " fundamentals", "Practice 15 " + s2 + " problems", "Take a timed aptitude test", "Update resume with latest projects"}),
                new Ph("Build", "Days 31–60", "Apply skills in projects",
                        new String[]{"Build a mini-project using " + s3, "Solve 20 medium coding problems", "Join a peer mock-interview session", "Write 2 project READMEs"}),
                new Ph("Interview-ready", "Days 61–90", "Prepare for " + role + " interviews",
                        new String[]{"Complete 3 full mock interviews", "Revise core CS: OS, DBMS, networks", "Practice HR and communication questions", "Apply to 10 matching roles"}));
        double doneChance = d.readiness().score() / 100.0;
        var out = new ArrayList<Map<String, Object>>();
        for (int i = 0; i < phases.size(); i++) {
            var ph = phases.get(i);
            var tasks = new ArrayList<Map<String, Object>>();
            for (String t : ph.tasks()) tasks.add(Map.of("title", t, "done", i == 0 ? r.nextDouble() < doneChance + 0.2 : i == 1 && r.nextDouble() < doneChance * 0.4));
            out.add(Map.of("name", ph.name(), "days", ph.days(), "focus", ph.focus(), "tasks", tasks));
        }
        return Map.of("targetRole", role, "phases", out);
    }

    private Object progress(StudentDashboard d) {
        var r = rnd(d.profile(), 7);
        int now = d.readiness().score();
        var weeks = new ArrayList<Map<String, Object>>();
        double v = now - 8 - r.nextInt(8);
        for (int i = 7; i >= 0; i--) {
            weeks.add(Map.of("week", "Week " + (8 - i), "date", LocalDate.now().minusWeeks(i).toString(), "score", clamp(v)));
            v += (now - v) / (i + 1.0) + (r.nextDouble() - 0.5) * 3;
        }
        weeks.set(weeks.size() - 1, Map.of("week", "Week 8", "date", LocalDate.now().toString(), "score", now));
        int first = (int) weeks.get(0).get("score");
        return Map.of("weekly", weeks, "change", now - first, "milestones", List.of(
                Map.of("title", "First assessment completed", "done", true),
                Map.of("title", "Readiness above 50%", "done", now >= 50),
                Map.of("title", "Readiness above 65% (Ready)", "done", now >= 65),
                Map.of("title", "Readiness above 80% (Placement Ready)", "done", now >= 80)));
    }
}
