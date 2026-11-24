package com.lakshya.backend.controller;

import com.lakshya.backend.model.Quiz;
import com.lakshya.backend.model.QuizAttempt;
import com.lakshya.backend.repository.QuizRepository;
import com.lakshya.backend.repository.QuizAttemptRepository;
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
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private UserService userService;

    @Operation(
            summary = "Create a new quiz",
            description = "Admin/mentor can create a new quiz for students"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Quiz created successfully"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        quiz.setCreatedBy(userService.getCurrentUser());
        Quiz savedQuiz = quizRepository.save(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuiz);
    }

    @Operation(
            summary = "Get all active quizzes",
            description = "Fetch all active quizzes"
    )
    @ApiResponse(
            responseCode = "200",
            description = "List of quizzes",
            content = @Content(schema = @Schema(implementation = Quiz.class))
    )
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAllActive();
        return ResponseEntity.ok(quizzes);
    }

    @Operation(
            summary = "Get quiz by ID",
            description = "Fetch a specific quiz by its ID"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Quiz found",
            content = @Content(schema = @Schema(implementation = Quiz.class))
    )
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        Optional<Quiz> quiz = quizRepository.findById(id);
        return quiz.map(ResponseEntity::ok).orElseGet(() ->
                ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Submit quiz attempt",
            description = "Student submits a quiz attempt"
    )
    @ApiResponse(
            responseCode = "201",
            description = "Quiz attempt created successfully"
    )
    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<QuizAttempt> submitQuizAttempt(
            @PathVariable Long quizId,
            @RequestParam Integer scoreObtained,
            @RequestParam Integer timeTakenMinutes,
            @RequestParam String answersJson) {
        
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        User student = userService.getCurrentUser();
        
        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(quiz);
        attempt.setScoreObtained((double) scoreObtained);
        attempt.setMaxScore(quiz.getPassingScore());
        attempt.setTimeTakenMinutes(timeTakenMinutes);
        attempt.setAnswersJson(answersJson);
        attempt.setStatus("COMPLETED");
        
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAttempt);
    }

    @Operation(
            summary = "Get quiz attempts by student",
            description = "View all quiz attempts by a student"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/student/{studentId}/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByStudent(@PathVariable Long studentId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentId(studentId);
        return ResponseEntity.ok(attempts);
    }

    @Operation(
            summary = "Get quiz attempts by quiz",
            description = "View all attempts for a specific quiz"
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/{quizId}/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttemptsByQuiz(@PathVariable Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);
        return ResponseEntity.ok(attempts);
    }
}