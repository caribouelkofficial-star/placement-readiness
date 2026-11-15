package com.placement.web;

import com.placement.model.Dtos.*;
import com.placement.model.MockData;
import com.placement.model.Onboarding;
import com.placement.model.Repo;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ApiController {
    private static final java.util.Set<String> SECTIONS = java.util.Set.of("overview", "profile", "skills", "aptitude",
            "coding", "readiness", "careers", "skill-gaps", "roadmap", "progress");
    private final Repo repo;
    private final MockData mock;

    public ApiController(Repo repo, MockData mock) {
        this.repo = repo;
        this.mock = mock;
    }

    private Object section(String name, UUID profileId) {
        if (!SECTIONS.contains(name)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        var d = repo.dashboard(profileId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!d.profile().onboarded())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student has not completed onboarding");
        return mock.section(name, d, repo.roles(), repo.resources(), repo.onboarding(profileId).orElse(null));
    }

    @GetMapping("/student/onboarding")
    public ResponseEntity<Onboarding> getOnboarding(Authentication auth) {
        return repo.onboarding(current(auth).id()).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/student/onboarding")
    public Profile saveOnboarding(@RequestBody Onboarding body, Authentication auth) {
        var me = current(auth);
        var roleTitles = repo.roles().stream().map(Repo.Role::title).collect(java.util.stream.Collectors.toSet());
        String error = body.validate(roleTitles);
        if (error != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error);
        repo.saveOnboarding(me.id(), body, body.scores());
        return current(auth);
    }

    @GetMapping("/roles")
    public List<Repo.Role> allRoles() {
        return repo.roles();
    }

    @GetMapping("/student/{section}")
    public Object studentSection(@PathVariable String section, Authentication auth) {
        return section(section, current(auth).id());
    }

    @GetMapping("/admin/students/{id}/{section}")
    public Object adminStudentSection(@PathVariable UUID id, @PathVariable String section) {
        return section(section, id);
    }

    @GetMapping("/resources")
    public List<Repo.Resource> resources() {
        return repo.resources();
    }

    @GetMapping("/admin/roles")
    public List<Repo.Role> roles() {
        return repo.roles();
    }

    @GetMapping("/admin/overview")
    public java.util.Map<String, Object> adminOverview() {
        return repo.adminStats();
    }

    private Profile current(Authentication auth) {
        return repo.profileByAuthUser(UUID.fromString(auth.getName()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No profile for this user"));
    }

    @PostMapping("/auth/session")
    public ResponseEntity<Void> recordLogin(Authentication auth) {
        current(auth);
        repo.recordLogin(UUID.fromString(auth.getName()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public Profile me(Authentication auth) {
        return current(auth);
    }

    @GetMapping("/student/dashboard")
    public StudentDashboard studentDashboard(Authentication auth) {
        return repo.dashboard(current(auth).id()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/admin/students")
    public List<StudentSummary> students() {
        return repo.students();
    }

    @GetMapping("/admin/students/{id}")
    public StudentDetail student(@PathVariable UUID id) {
        var d = repo.dashboard(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new StudentDetail(d.profile(), d.academics(), d.readiness(), repo.recentLogins(id));
    }
}
