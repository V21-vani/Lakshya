package com.lakshya.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private UUID applicationId = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_drive_id", nullable = false)
    private PlacementDrive placementDrive;

    @Column(name = "status", nullable = false, columnDefinition = "varchar(20) default 'PENDING'")
    private String status = "PENDING"; // PENDING, SHORTLISTED, REJECTED, INTERVIEW_SCHEDULED

    @Column(name = "score_obtained")
    private Double scoreObtained;

    @Column(name = "technical_round_status")
    private String technicalRoundStatus; // PENDING, CLEARED, FAILED

    @Column(name = "hr_round_status")
    private String hrRoundStatus; // PENDING, CLEARED, FAILED

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "mentor_comments", columnDefinition = "text")
    private String mentorComments;
}