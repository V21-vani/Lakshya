package com.vtu.placement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Contracts for PDF report generation. */
public final class ReportDtos {
    private ReportDtos() {}

    /** One row in the assessment history table (quiz or coding test). */
    public record AssessmentEntry(String title, String type, Double score, Double maxScore, String date) {}

    public record ReportRequest(@NotNull Long studentId,
                                @NotBlank String studentName,
                                String email,
                                Double aptitudeScore,
                                Double codingScore,
                                Integer problemsSolved,
                                List<AssessmentEntry> assessments,
                                List<EligibilityDtos.EligibilityResponse> eligibilities) {}
}
