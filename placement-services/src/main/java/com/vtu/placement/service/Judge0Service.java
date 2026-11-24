package com.vtu.placement.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.vtu.placement.config.Judge0Properties;
import com.vtu.placement.dto.CodeExecutionDtos.ExecutionRequest;
import com.vtu.placement.dto.CodeExecutionDtos.ExecutionResponse;
import com.vtu.placement.dto.CodeExecutionDtos.TestCase;
import com.vtu.placement.dto.CodeExecutionDtos.TestCaseResult;
import com.vtu.placement.exception.ExternalServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Talks to the Judge0 code-execution API.
 *
 * Flow for every test case:
 *   1. POST /submissions?wait=true  with {source_code, language_id, stdin}
 *   2. Judge0 compiles + runs the code in a sandbox and returns stdout/stderr/status.
 *   3. WE compare stdout with the expected output (normalised) to decide pass / fail.
 *
 * Why compare ourselves instead of sending expected_output to Judge0?
 * It lets us ignore trailing spaces / Windows line endings and gives us full control of the verdict.
 */
@Service
public class Judge0Service {

    /** Judge0 CE language ids. Full list: GET {base-url}/languages */
    private static final Map<String, Integer> LANGUAGE_IDS = Map.of(
            "c", 50,
            "cpp", 54,
            "java", 62,        // NOTE: the public class must be named Main
            "python", 71,
            "javascript", 63);

    /** Judge0 status ids we care about. */
    private static final int STATUS_ACCEPTED = 3;          // program ran successfully
    private static final int STATUS_TIME_LIMIT = 5;
    private static final int STATUS_COMPILATION_ERROR = 6;

    private final WebClient judge0Client;
    private final Judge0Properties props;

    public Judge0Service(WebClient judge0WebClient, Judge0Properties props) {
        this.judge0Client = judge0WebClient;
        this.props = props;
    }

    // ------------------------------------------------------------------ public API

    /** Runs the code against all test cases and builds the overall verdict. */
    public ExecutionResponse evaluate(ExecutionRequest request) {
        int languageId = resolveLanguageId(request.language());

        List<TestCaseResult> results = new ArrayList<>();
        String compileOutput = null;
        String failureVerdict = null;          // verdict of the first failing test case
        double maxTime = 0;
        int maxMemory = 0;
        int passed = 0;
        int index = 1;

        for (TestCase tc : request.testCases()) {
            Judge0Response r = runSingle(request.sourceCode(), languageId, tc.input());
            int statusId = r.status() == null ? -1 : r.status().id();

            // A compile error will be identical for every test case, so stop immediately.
            if (statusId == STATUS_COMPILATION_ERROR) {
                compileOutput = r.compileOutput();
                failureVerdict = "COMPILATION_ERROR";
                results.add(new TestCaseResult(index, tc.hidden(), false, "Compilation Error",
                        null, null, null, null, null));
                break;
            }

            boolean isPass = statusId == STATUS_ACCEPTED
                    && normalise(r.stdout()).equals(normalise(tc.expectedOutput()));
            if (isPass) {
                passed++;
            } else if (failureVerdict == null) {
                failureVerdict = toVerdict(statusId);
            }

            Double time = r.time() == null ? null : Double.valueOf(r.time());
            if (time != null) maxTime = Math.max(maxTime, time);
            if (r.memory() != null) maxMemory = Math.max(maxMemory, r.memory());

            String statusLabel = (statusId == STATUS_ACCEPTED && !isPass)
                    ? "Wrong Answer" : (r.status() == null ? "Unknown" : r.status().description());

            // Hidden test cases must not leak their data to the student.
            results.add(new TestCaseResult(index, tc.hidden(), isPass, statusLabel,
                    tc.hidden() ? null : r.stdout(),
                    tc.hidden() ? null : tc.expectedOutput(),
                    tc.hidden() ? null : r.stderr(),
                    time, r.memory()));
            index++;
        }

        String verdict = (failureVerdict == null) ? "ACCEPTED" : failureVerdict;
        return new ExecutionResponse(null, verdict, passed, request.testCases().size(),
                maxTime, maxMemory, compileOutput, results);
    }

    // ------------------------------------------------------------------ helpers

    private int resolveLanguageId(String language) {
        Integer id = LANGUAGE_IDS.get(language.toLowerCase());
        if (id == null) {
            throw new IllegalArgumentException(
                    "Unsupported language '" + language + "'. Supported: " + LANGUAGE_IDS.keySet());
        }
        return id;
    }

    /** One HTTP call to Judge0. wait=true makes Judge0 answer only after execution finishes. */
    private Judge0Response runSingle(String sourceCode, int languageId, String stdin) {
        Map<String, Object> body = new HashMap<>();
        body.put("source_code", sourceCode);
        body.put("language_id", languageId);
        body.put("stdin", stdin == null ? "" : stdin);

        try {
            Judge0Response response = judge0Client.post()
                    .uri("/submissions?base64_encoded=false&wait=true")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Judge0Response.class)
                    .block(Duration.ofSeconds(props.timeoutSeconds()));
            if (response == null) {
                throw new ExternalServiceException("Judge0 returned an empty response", null);
            }
            return response;
        } catch (WebClientResponseException e) {
            throw new ExternalServiceException(
                    "Judge0 returned HTTP " + e.getStatusCode().value() + ": " + e.getResponseBodyAsString(), e);
        } catch (ExternalServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ExternalServiceException("Judge0 unreachable or timed out: " + e.getMessage(), e);
        }
    }

    /** Maps a Judge0 status id to our verdict vocabulary. */
    private String toVerdict(int statusId) {
        return switch (statusId) {
            case STATUS_ACCEPTED -> "WRONG_ANSWER";   // ran fine but output differed
            case STATUS_TIME_LIMIT -> "TIME_LIMIT_EXCEEDED";
            case 13, 14 -> "INTERNAL_ERROR";
            default -> "RUNTIME_ERROR";                // ids 7-12: segfault, exception, ...
        };
    }

    /** Ignores Windows line endings and trailing whitespace so "5\r\n" equals "5". */
    static String normalise(String s) {
        if (s == null) return "";
        return s.replace("\r\n", "\n").lines()
                .map(String::stripTrailing)
                .collect(Collectors.joining("\n"))
                .stripTrailing();
    }

    // ------------------------------------------------------------------ Judge0 JSON shape

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Judge0Response(String stdout,
                          String stderr,
                          @JsonProperty("compile_output") String compileOutput,
                          Status status,
                          String time,
                          Integer memory) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Status(int id, String description) {}
}
