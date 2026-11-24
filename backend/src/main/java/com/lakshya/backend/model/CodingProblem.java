package com.lakshya.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coding_problems")
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(name = "input_format", columnDefinition = "text")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "text")
    private String outputFormat;

    @Column(name = "constraints", columnDefinition = "text")
    private String constraints;

    @Column(name = "time_limit", nullable = false)
    private Integer timeLimit = 2; // in seconds

    @Column(name = "memory_limit", nullable = false)
    private Integer memoryLimit = 256; // in MB

    @Column(name = "topic", nullable = false)
    private String topic; // e.g., ARRAYS, STRINGS, DP, GREEDY, etc.

    @Column(name = "test_cases_json", columnDefinition = "text")
    private String testCasesJson; // JSON format containing test cases

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @JsonIgnore
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Submission> submissions;
}