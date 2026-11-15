package com.placement.web;

import com.placement.model.Dtos.*;
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
    private final Repo repo;

    public ApiController(Repo repo) {
        this.repo = repo;
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
