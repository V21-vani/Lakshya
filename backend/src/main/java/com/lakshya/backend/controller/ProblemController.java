package com.lakshya.backend.controller;

import com.lakshya.backend.model.CodingProblem;
import com.lakshya.backend.repository.CodingProblemRepository;
import com.lakshya.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import com.lakshya.backend.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    @Autowired
    private CodingProblemRepository problemRepository;

    @Autowired
    private UserService userService;

    @Operation(
            summary = "Create a new coding problem",
            description = "Admin/mentor can create a new coding problem with test cases"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Problem created successfully",
            content = @Content(schema = @Schema(implementation = CodingProblem.class))
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<CodingProblem> createProblem(@Valid @RequestBody CodingProblem problem) {
        // Set the creator as the current user
        problem.setCreatedBy(userService.getCurrentUser());
        CodingProblem savedProblem = problemRepository.save(problem);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProblem);
    }

    @Operation(
            summary = "Get all active coding problems",
            description = "Fetch all active coding problems, optionally filtered by topic"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of coding problems",
            content = @Content(schema = @Schema(implementation = CodingProblem.class))
    )
    @GetMapping
    public ResponseEntity<List<CodingProblem>> getAllProblems(
            @RequestParam(required = false) String topic) {
        if (topic != null) {
            List<CodingProblem> problems = problemRepository.findByTopic(topic);
            return ResponseEntity.ok(problems);
        }
        List<CodingProblem> problems = problemRepository.findAllActiveOrderByCreatedDesc();
        return ResponseEntity.ok(problems);
    }

    @Operation(
            summary = "Get problem by ID",
            description = "Fetch a specific coding problem by its ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Problem found",
            content = @Content(schema = @Schema(implementation = CodingProblem.class))
    )
    @GetMapping("/{id}")
    public ResponseEntity<CodingProblem> getProblemById(@PathVariable Long id) {
        Optional<CodingProblem> problem = problemRepository.findById(id);
        return problem.map(ResponseEntity::ok).orElseGet(() ->
                ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get problems by difficulty",
            description = "Fetch problems filtered by difficulty level"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of problems with specified difficulty",
            content = @Content(schema = @Schema(implementation = CodingProblem.class))
    )
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<CodingProblem>> getByDifficulty(@PathVariable String difficulty) {
        List<CodingProblem> problems = problemRepository.findByDifficulty(difficulty);
        return ResponseEntity.ok(problems);
    }

    @Operation(
            summary = "Update a problem",
            description = "Admin/mentor can update problem details"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Problem updated successfully"
    )
    @PatchMapping("/{id}")
    public ResponseEntity<CodingProblem> updateProblem(@PathVariable Long id,
                                                       @Valid @RequestBody CodingProblem problemDetails) {
        return problemRepository.findById(id).map(problem -> {
            problem.setTitle(problemDetails.getTitle());
            problem.setDescription(problemDetails.getDescription());
            problem.setDifficulty(problemDetails.getDifficulty());
            problem.setTopic(problemDetails.getTopic());
            problem.setTimeLimit(problemDetails.getTimeLimit());
            problem.setMemoryLimit(problemDetails.getMemoryLimit());
            problem.setTestCasesJson(problemDetails.getTestCasesJson());
            CodingProblem updatedProblem = problemRepository.save(problem);
            return ResponseEntity.ok(updatedProblem);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Delete a problem",
            description = "Admin/mentor can delete a problem"
    )
    @ApiResponse(
            responseCode = "204",
            description = "Problem deleted successfully"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        return problemRepository.findById(id).map(problem -> {
            problemRepository.delete(problem);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}