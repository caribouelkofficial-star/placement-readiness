package com.placement;

import static org.junit.jupiter.api.Assertions.*;

import com.placement.web.PasswordService;
import org.junit.jupiter.api.Test;

class PasswordPolicyTest {
    @Test void acceptsStrongPassword() { assertNull(PasswordService.policyError("old-Pass1", "New-Pass-2026")); }
    @Test void rejectsShort() { assertNotNull(PasswordService.policyError("old", "Ab1")); }
    @Test void rejectsMissingClasses() {
        assertNotNull(PasswordService.policyError("old", "alllowercase1"));
        assertNotNull(PasswordService.policyError("old", "ALLUPPERCASE1"));
        assertNotNull(PasswordService.policyError("old", "NoDigitsHere"));
    }
    @Test void rejectsSameAsCurrent() { assertNotNull(PasswordService.policyError("Same-Pass1", "Same-Pass1")); }
    @Test void requiresCurrent() { assertNotNull(PasswordService.policyError("", "New-Pass-2026")); }
}
