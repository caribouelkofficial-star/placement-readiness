package com.placement;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.placement.config.SecurityConfig;
import com.placement.model.Dtos.Profile;
import com.placement.model.Repo;
import com.placement.web.ApiController;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ApiController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "app.allowed-origin=http://localhost:5173")
class ApiSecurityTest {
    @Autowired MockMvc mvc;
    @MockBean Repo repo;
    @MockBean JwtDecoder decoder;

    private static SimpleGrantedAuthority role(String r) { return new SimpleGrantedAuthority("ROLE_" + r); }

    @Test void noTokenIs401() throws Exception {
        mvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/students")).andExpect(status().isUnauthorized());
    }

    @Test void studentCannotReachAdmin() throws Exception {
        mvc.perform(get("/api/admin/students").with(jwt().authorities(role("STUDENT")))).andExpect(status().isForbidden());
    }

    @Test void adminCannotUseStudentDashboard() throws Exception {
        mvc.perform(get("/api/student/dashboard").with(jwt().authorities(role("ADMIN")))).andExpect(status().isForbidden());
    }

    @Test void adminListsStudents() throws Exception {
        when(repo.students()).thenReturn(List.of());
        mvc.perform(get("/api/admin/students").with(jwt().authorities(role("ADMIN")))).andExpect(status().isOk());
    }

    @Test void meReturnsProfile() throws Exception {
        UUID uid = UUID.randomUUID();
        when(repo.profileByAuthUser(any())).thenReturn(Optional.of(new Profile(UUID.randomUUID(), "A", "a@x.com", "student", null)));
        mvc.perform(get("/api/me").with(jwt().jwt(j -> j.subject(uid.toString())))).andExpect(status().isOk());
    }
}
