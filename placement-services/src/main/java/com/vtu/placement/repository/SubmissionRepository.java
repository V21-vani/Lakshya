package com.vtu.placement.repository;

import com.vtu.placement.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/** Spring Data generates the SQL from the method names, so no implementation is written by hand. */
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    long countByStudentId(Long studentId);

    /** Distinct problems with at least one ACCEPTED submission = "problems solved". */
    @Query("select count(distinct s.problemId) from Submission s "
            + "where s.studentId = :studentId and s.verdict = 'ACCEPTED'")
    long countSolvedProblems(@Param("studentId") Long studentId);
}
