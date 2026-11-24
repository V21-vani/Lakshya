package com.vtu.placement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Contracts for the eligibility engine. */
public final class EligibilityDtos {
    private EligibilityDtos() {}

    /** Snapshot of a student's performance (assembled by Member 1's APIs / the front-end). */
    public record StudentProfile(@NotNull Long studentId,
                                 @NotBlank String name,
                                 String email,
                                 Double aptitudeScore,    // percentage 0-100
                                 Double codingScore,      // percentage 0-100
                                 Integer problemsSolved,
                                 Double cgpa,
                                 Integer backlogs,
                                 List<String> skills) {}

    /** Hiring criteria of a drive. A null field means "this rule is not enforced". */
    public record DriveCriteria(@NotNull Long driveId,
                                @NotBlank String companyName,
                                Double minAptitudeScore,
                                Double minCodingScore,
                                Integer minProblemsSolved,
                                Double minCgpa,
                                Integer maxBacklogs,
                                List<String> requiredSkills,
                                Double minSkillMatchPercent) {}   // default 100 when skills are required

    public record EligibilityRequest(@Valid @NotNull StudentProfile student,
                                     @Valid @NotNull DriveCriteria criteria) {}

    public record BulkEligibilityRequest(@Valid @NotNull DriveCriteria criteria,
                                         @NotEmpty List<@Valid StudentProfile> students) {}

    /** One line of the eligibility checklist (shown as a tick/cross in the UI). */
    public record CriterionResult(String criterion, String required, String actual, boolean passed) {}

    public record EligibilityResponse(Long studentId,
                                      String studentName,
                                      Long driveId,
                                      String companyName,
                                      boolean eligible,
                                      double readinessPercent,
                                      List<CriterionResult> checks,
                                      List<String> missingSkills,
                                      String summary) {}
}
