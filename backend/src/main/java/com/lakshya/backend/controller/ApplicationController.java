package com.lakshya.backend.controller;

import com.lakshya.backend.model.Application;
import com.lakshya.backend.repository.ApplicationRepository;
import com.lakshya.backend.repository.PlacementDriveRepository;
import com.lakshya.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import com.lakshya.backend.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private PlacementDriveRepository placementDriveRepository;

    @Autowired
    private UserService userService;

    @Operation(
            summary = "Student applies for a placement drive",
            description = "Student can apply for a placement drive if eligible"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Application submitted successfully",
            content = @Content(schema = @Schema(implementation = Application.class))
    )
    @PostMapping
    public ResponseEntity<Application> applyForDrive(@RequestBody Application application) {
        // Set the student from the authenticated user
        User student = userService.getCurrentUser();
        application.setStudent(student);
        if (application.getPlacementDrive() == null || application.getPlacementDrive().getId() == null) {
            throw new RuntimeException("placementDrive.id is required");
        }
        application.setPlacementDrive(placementDriveRepository.findById(application.getPlacementDrive().getId())
                .orElseThrow(() -> new RuntimeException("Placement drive not found")));
        application.setAppliedAt(java.time.LocalDateTime.now());
        
        // Check eligibility based on scores
        // This logic can be expanded based on company requirements
        
        Application savedApplication = applicationRepository.save(application);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedApplication);
    }

    @Operation(
            summary = "Get all applications for a placement drive",
            description = "Admin/mentor can view all applications for a drive"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of applications",
            content = @Content(schema = @Schema(implementation = Application.class))
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/drive/{driveId}")
    public ResponseEntity<List<Application>> getApplicationsByDrive(@PathVariable Long driveId) {
        List<Application> applications = applicationRepository.findByPlacementDriveId(driveId);
        return ResponseEntity.ok(applications);
    }

    @Operation(
            summary = "Get applications for a student",
            description = "View all applications submitted by a student"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Application>> getApplicationsByStudent(@PathVariable Long studentId) {
        List<Application> applications = applicationRepository.findByStudentId(studentId);
        return ResponseEntity.ok(applications);
    }

    @Operation(
            summary = "Update application status",
            description = "Admin/mentor can update application status (shortlist, reject, etc.)"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Application status updated successfully"
    )
    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return applicationRepository.findById(id).map(application -> {
            application.setStatus(status);
            Application updated = applicationRepository.save(application);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}