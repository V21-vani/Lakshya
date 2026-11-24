package com.vtu.placement.service;

import com.vtu.placement.dto.EligibilityDtos.DriveCriteria;
import com.vtu.placement.dto.EligibilityDtos.EligibilityResponse;
import com.vtu.placement.dto.EligibilityDtos.StudentProfile;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Plain JUnit tests: the engine has no dependencies, so no Spring context is needed (fast). */
class EligibilityServiceTest {

    private final EligibilityService service = new EligibilityService();

    private final DriveCriteria criteria = new DriveCriteria(1L, "Infosys",
            60.0, 50.0, 10, 7.0, 0, List.of("Java", "SQL"), 100.0);

    @Test
    void eligibleWhenAllCriteriaMet() {
        StudentProfile s = new StudentProfile(1L, "Asha", "a@x.com", 75.0, 70.0, 15, 8.2, 0,
                List.of("java", "SQL", "React"));
        EligibilityResponse r = service.check(s, criteria);
        assertTrue(r.eligible());
        assertEquals(100.0, r.readinessPercent());
        assertTrue(r.missingSkills().isEmpty());
    }

    @Test
    void notEligibleWhenScoreAndSkillsFail() {
        StudentProfile s = new StudentProfile(2L, "Ravi", "r@x.com", 40.0, 70.0, 15, 8.2, 0,
                List.of("Java"));
        EligibilityResponse r = service.check(s, criteria);
        assertFalse(r.eligible());
        assertEquals(List.of("SQL"), r.missingSkills());
        assertEquals(66.7, r.readinessPercent());   // 4 of 6 rules passed
    }

    @Test
    void backlogsAreAMaximumRule() {
        StudentProfile s = new StudentProfile(3L, "Meena", null, 90.0, 90.0, 30, 9.0, 2,
                List.of("Java", "SQL"));
        assertFalse(service.check(s, criteria).eligible());
    }

    @Test
    void nullRulesAreNotEnforced() {
        DriveCriteria open = new DriveCriteria(2L, "OpenCo", null, null, null, null, null, null, null);
        StudentProfile s = new StudentProfile(4L, "Zed", null, null, null, null, null, null, null);
        assertTrue(service.check(s, open).eligible());
    }
}
