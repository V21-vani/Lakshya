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
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(columnDefinition = "text")
    private String jobDescription;

    @Column(name = "required_tech_stacks", columnDefinition = "text")
    private String requiredTechStacks; // JSON array of required technologies

    @Column(name = "minimum_score")
    private Double minimumScore; // Minimum placement test score required

    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @JsonIgnore
    @OneToMany(mappedBy = "placementDrive", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Application> applications;

    @JsonIgnore
    @OneToMany(mappedBy = "drive", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MentorAssignment> mentorAssignments;
}