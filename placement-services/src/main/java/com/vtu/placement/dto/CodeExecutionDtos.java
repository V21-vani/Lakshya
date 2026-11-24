package com.vtu.placement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request/response contracts for the code-execution API (Judge0).
 * Java records are used because DTOs are plain immutable data carriers.
 */
public final class CodeExecutionDtos {
    private CodeExecutionDtos() {}

    /** One test case. Member 1 stores these per Problem; Member 4's form creates them. */
    public record TestCase(String input,
                           @NotNull String expectedOutput,
                           boolean hidden) {}

    /** Sent by the student code editor (Member 3). */
    public record ExecutionRequest(@NotNull Long studentId,
                                   @NotNull Long problemId,
                                   @NotBlank String language,      // java | python | cpp | c | javascript
                                   @NotBlank String sourceCode,
                                   @NotEmpty List<@Valid TestCase> testCases) {}

    /** Result of one test case. For hidden cases the actual/expected text is withheld. */
    public record TestCaseResult(int index,
                                 boolean hidden,
                                 boolean passed,
                                 String status,
                                 String actualOutput,
                                 String expectedOutput,
                                 String stderr,
                                 Double timeSeconds,
                                 Integer memoryKb) {}

    /** Overall verdict returned to the UI. submissionId is null for /run (not persisted). */
    public record ExecutionResponse(Long submissionId,
                                    String verdict,
                                    int passed,
                                    int total,
                                    Double maxTimeSeconds,
                                    Integer maxMemoryKb,
                                    String compileOutput,
                                    List<TestCaseResult> results) {
        public ExecutionResponse withSubmissionId(Long id) {
            return new ExecutionResponse(id, verdict, passed, total, maxTimeSeconds,
                    maxMemoryKb, compileOutput, results);
        }
    }

    /** Feeds the eligibility engine / dashboard: how many problems has this student solved? */
    public record StudentStats(Long studentId, long totalSubmissions, long problemsSolved) {}
}
