package com.vtu.placement.controller;

import com.vtu.placement.dto.CodeExecutionDtos.ExecutionRequest;
import com.vtu.placement.dto.CodeExecutionDtos.ExecutionResponse;
import com.vtu.placement.dto.CodeExecutionDtos.StudentStats;
import com.vtu.placement.model.Submission;
import com.vtu.placement.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Endpoints used by the student code editor (Member 3). Controllers stay thin: validate, delegate, return. */
@RestController
@RequestMapping("/api/execution")
public class CodeExecutionController {

    private final SubmissionService submissionService;

    public CodeExecutionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    /** "Run": test against sample cases, nothing is saved. */
    @PostMapping("/run")
    public ExecutionResponse run(@Valid @RequestBody ExecutionRequest request) {
        return submissionService.run(request);
    }

    /** "Submit": graded and stored. */
    @PostMapping("/submit")
    public ExecutionResponse submit(@Valid @RequestBody ExecutionRequest request) {
        return submissionService.submit(request);
    }

    @GetMapping("/history/{studentId}")
    public List<Submission> history(@PathVariable Long studentId) {
        return submissionService.history(studentId);
    }

    @GetMapping("/stats/{studentId}")
    public StudentStats stats(@PathVariable Long studentId) {
        return submissionService.stats(studentId);
    }
}
