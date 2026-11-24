package com.vtu.placement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * One graded code submission. Stored so the dashboard (Member 3) can show history and
 * the eligibility engine can count "problems solved".
 * studentId / problemId are plain IDs (not @ManyToOne) so this module stays decoupled from
 * Member 1's User and Problem entities; when merged they can be turned into real relations.
 */
@Entity
@Table(name = "code_submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Long studentId;
    @Column(nullable = false) private Long problemId;
    @Column(nullable = false) private String language;
    @Column(nullable = false) private String verdict;       // ACCEPTED, WRONG_ANSWER, ...
    private int passedCount;
    private int totalCount;
    private Double maxTimeSeconds;
    private Instant submittedAt;

    @Column(length = 20000)
    private String sourceCode;

    @PrePersist
    void onCreate() {
        this.submittedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public int getPassedCount() { return passedCount; }
    public void setPassedCount(int passedCount) { this.passedCount = passedCount; }
    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
    public Double getMaxTimeSeconds() { return maxTimeSeconds; }
    public void setMaxTimeSeconds(Double maxTimeSeconds) { this.maxTimeSeconds = maxTimeSeconds; }
    public Instant getSubmittedAt() { return submittedAt; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
}
