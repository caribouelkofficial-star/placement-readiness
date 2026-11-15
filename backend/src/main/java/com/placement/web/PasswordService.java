package com.placement.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Changes a user's password through Supabase Auth using the user's own access token.
 * No service-role key is needed or stored: the current password is re-verified first, then the user updates themselves.
 */
@Service
public class PasswordService {
    private final RestClient http = RestClient.create();
    private final ObjectMapper json = new ObjectMapper();
    private final String authUrl;
    private final String anonKey;

    public PasswordService(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String authUrl,
                           @Value("${app.supabase-anon-key:}") String anonKey) {
        this.authUrl = authUrl;
        this.anonKey = anonKey;
    }

    /** Returns a message describing the first policy violation, or null when the new password is acceptable. */
    public static String policyError(String current, String next) {
        if (current == null || current.isEmpty()) return "Enter your current password";
        if (next == null || next.length() < 8) return "New password must be at least 8 characters";
        if (next.length() > 72) return "New password must be at most 72 characters";
        if (!next.matches(".*[a-z].*") || !next.matches(".*[A-Z].*") || !next.matches(".*\\d.*"))
            return "New password needs an uppercase letter, a lowercase letter and a number";
        if (next.equals(current)) return "New password must be different from the current one";
        return null;
    }

    public void change(String email, String accessToken, String current, String next) {
        String error = policyError(current, next);
        if (error != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error);
        if (anonKey.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Password change is not configured");
        if (email == null || email.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account has no email");

        try {   // 1. re-verify the current password
            http.post().uri(authUrl + "/token?grant_type=password").header("apikey", anonKey)
                    .contentType(MediaType.APPLICATION_JSON).body(Map.of("email", email, "password", current))
                    .retrieve().toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again in a minute.");
            if (e.getStatusCode().is4xxClientError()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Authentication service error");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Authentication service unavailable");
        }

        try {   // 2. update the password as the user
            http.put().uri(authUrl + "/user").header("apikey", anonKey).header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON).body(Map.of("password", next))
                    .retrieve().toBodilessEntity();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().is4xxClientError()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message(e));
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Authentication service error");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Authentication service unavailable");
        }
    }

    private String message(RestClientResponseException e) {
        try {
            var node = json.readTree(e.getResponseBodyAsString());
            for (String k : new String[]{"msg", "message", "error_description"})
                if (node.hasNonNull(k)) return node.get(k).asText();
        } catch (Exception ignored) { /* fall through */ }
        return "Could not change the password";
    }
}
