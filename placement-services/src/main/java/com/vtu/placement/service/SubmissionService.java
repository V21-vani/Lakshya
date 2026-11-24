package com.vtu.placement.service;

import com.vtu.placement.dto.CodeExecutionDtos.ExecutionRequest;
import com.vtu.placement.dto.CodeExecutionDtos.ExecutionResponse;
import com.vtu.placement.dto.CodeExecutionDtos.StudentStats;
import com.vtu.placement.model.Submission;
import com.vtu.placement.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Orchestration layer: Judge0Service only executes code; this class decides what is saved.
 *  - run    : "Run" button, sample tests, nothing stored.
 *  - submit : "Submit" button, all tests, result stored for analytics and eligibility.
 */
@Service
public class SubmissionService {

    private final Judge0Service judge0Service;
    private final SubmissionRepository repository;

    public SubmissionService(Judge0Service judge0Service, SubmissionRepository repository) {
        this.judge0Service = judge0Service;
        this.repository = repository;
    }

    public ExecutionResponse run(ExecutionRequest request) {
        return judge0Service.evaluate(request);
    }

    @Transactional
    public ExecutionResponse submit(ExecutionRequest request) {
        ExecutionResponse result = judge0Service.evaluate(request);

        Submission s = new Submission();
        s.setStudentId(request.studentId());
        s.setProblemId(request.problemId());
        s.setLanguage(request.language().toLowerCase());
        s.setVerdict(result.verdict());
        s.setPassedCount(result.passed());
        s.setTotalCount(result.total());
        s.setMaxTimeSeconds(result.maxTimeSeconds());
        s.setSourceCode(request.sourceCode());
        repository.save(s);

        return result.withSubmissionId(s.getId());
    }

    @Transactional(readOnly = true)
    public List<Submission> history(Long studentId) {
        return repository.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    @Transactional(readOnly = true)
    public StudentStats stats(Long studentId) {
        return new StudentStats(studentId,
                repository.countByStudentId(studentId),
                repository.countSolvedProblems(studentId));
    }
}
