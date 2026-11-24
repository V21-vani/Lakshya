package com.vtu.placement.service;

import com.vtu.placement.dto.EligibilityDtos.BulkEligibilityRequest;
import com.vtu.placement.dto.EligibilityDtos.CriterionResult;
import com.vtu.placement.dto.EligibilityDtos.DriveCriteria;
import com.vtu.placement.dto.EligibilityDtos.EligibilityResponse;
import com.vtu.placement.dto.EligibilityDtos.StudentProfile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Rule-based eligibility engine (pure logic: no database, no HTTP, so it is trivial to unit test).
 *
 * A student is ELIGIBLE only if EVERY enforced rule passes.
 * A rule is "enforced" when the drive defines it (non-null). Rules:
 *   1. minimum aptitude %          4. minimum CGPA
 *   2. minimum coding %            5. maximum active backlogs
 *   3. minimum problems solved     6. required tech-stack skills (match % threshold)
 *
 * readinessPercent = (rules passed / rules enforced) * 100.
 * It tells a student who is NOT eligible how close they are.
 */
@Service
public class EligibilityService {

    public EligibilityResponse check(StudentProfile s, DriveCriteria c) {
        List<CriterionResult> checks = new ArrayList<>();

        addMinimumCheck(checks, "Aptitude score (%)", s.aptitudeScore(), c.minAptitudeScore());
        addMinimumCheck(checks, "Coding score (%)", s.codingScore(), c.minCodingScore());
        addMinimumCheck(checks, "Problems solved",
                s.problemsSolved() == null ? null : s.problemsSolved().doubleValue(),
                c.minProblemsSolved() == null ? null : c.minProblemsSolved().doubleValue());
        addMinimumCheck(checks, "CGPA", s.cgpa(), c.minCgpa());

        // Backlogs are a MAXIMUM rule (fewer is better), so it is handled separately.
        if (c.maxBacklogs() != null) {
            int actual = s.backlogs() == null ? 0 : s.backlogs();
            checks.add(new CriterionResult("Active backlogs",
                    "<= " + c.maxBacklogs(), String.valueOf(actual), actual <= c.maxBacklogs()));
        }

        // Skills: compare case-insensitively so "Java" == "java".
        List<String> missingSkills = new ArrayList<>();
        if (c.requiredSkills() != null && !c.requiredSkills().isEmpty()) {
            Set<String> studentSkills = lowerCaseSet(s.skills());
            int matched = 0;
            for (String required : c.requiredSkills()) {
                if (studentSkills.contains(required.toLowerCase(Locale.ROOT).trim())) matched++;
                else missingSkills.add(required);
            }
            double matchPercent = matched * 100.0 / c.requiredSkills().size();
            double threshold = c.minSkillMatchPercent() == null ? 100.0 : c.minSkillMatchPercent();
            checks.add(new CriterionResult("Skill match (%)",
                    ">= " + format(threshold), format(matchPercent), matchPercent >= threshold));
        }

        boolean eligible = checks.stream().allMatch(CriterionResult::passed);
        long passedCount = checks.stream().filter(CriterionResult::passed).count();
        double readiness = checks.isEmpty() ? 100.0 : round1(passedCount * 100.0 / checks.size());

        return new EligibilityResponse(s.studentId(), s.name(), c.driveId(), c.companyName(),
                eligible, readiness, checks, missingSkills, buildSummary(eligible, c.companyName(), checks));
    }

    /** Evaluates many students for one drive (admin "who can apply?" screen). Eligible first, then by readiness. */
    public List<EligibilityResponse> checkBulk(BulkEligibilityRequest request) {
        return request.students().stream()
                .map(st -> check(st, request.criteria()))
                .sorted(Comparator.comparing(EligibilityResponse::eligible).reversed()
                        .thenComparing(Comparator.comparingDouble(EligibilityResponse::readinessPercent).reversed()))
                .toList();
    }

    // ------------------------------------------------------------------ helpers

    /** Adds a ">= minimum" rule if the drive defines one. A missing student value counts as 0. */
    private void addMinimumCheck(List<CriterionResult> checks, String name, Double actual, Double minimum) {
        if (minimum == null) return;                       // rule not enforced
        double value = actual == null ? 0.0 : actual;
        checks.add(new CriterionResult(name, ">= " + format(minimum), format(value), value >= minimum));
    }

    private String buildSummary(boolean eligible, String company, List<CriterionResult> checks) {
        if (eligible) return "Eligible for " + company + ": all criteria satisfied.";
        String failed = checks.stream().filter(ch -> !ch.passed())
                .map(CriterionResult::criterion).collect(Collectors.joining(", "));
        return "Not eligible for " + company + ". Failed: " + failed + ".";
    }

    private Set<String> lowerCaseSet(List<String> items) {
        if (items == null) return Set.of();
        return items.stream().map(i -> i.toLowerCase(Locale.ROOT).trim()).collect(Collectors.toSet());
    }

    /** 60.0 -> "60", 7.5 -> "7.5" (prettier in the UI). */
    private String format(double d) {
        return d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(round1(d));
    }

    private double round1(double d) {
        return Math.round(d * 10.0) / 10.0;
    }
}
