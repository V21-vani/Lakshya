package com.lakshya.backend.seed;

import com.lakshya.backend.model.*;
import com.lakshya.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Seeds demo data on first start (only when the users table is empty).
 * Demo logins: admin / mentor1 / student1, all with password "password123".
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SeedDataLoader implements ApplicationRunner {

    static final String DEMO_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final CodingProblemRepository problemRepository;
    private final PlacementDriveRepository driveRepository;
    private final QuizRepository quizRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        String hash = passwordEncoder.encode(DEMO_PASSWORD);

        User admin = user("admin", "admin@lakshya.edu", "ADMIN", hash, true);
        user("mentor1", "mentor1@lakshya.edu", "MENTOR", hash, true);
        user("student1", "student1@lakshya.edu", "STUDENT", hash, false);

        CodingProblem problem1 = new CodingProblem();
        problem1.setTitle("Two Sum Problem");
        problem1.setDescription("Given an array, find two numbers that add up to target");
        problem1.setDifficulty("EASY");
        problem1.setTopic("ARRAYS");
        problem1.setTestCasesJson("{\"testCases\": [{\"input\": {\"nums\": [2,7,11,15], \"target\": 9}, \"output\": [0,1]}]}");
        problem1.setCreatedBy(admin);
        problemRepository.save(problem1);

        CodingProblem problem2 = new CodingProblem();
        problem2.setTitle("Fibonacci Sequence");
        problem2.setDescription("Calculate nth Fibonacci number");
        problem2.setDifficulty("EASY");
        problem2.setTopic("MATH");
        problem2.setTestCasesJson("{\"testCases\": [{\"input\": {\"n\": 10}, \"output\": 55}]}");
        problem2.setCreatedBy(admin);
        problemRepository.save(problem2);

        PlacementDrive drive = new PlacementDrive();
        drive.setCompanyName("Acme Technologies");
        drive.setJobTitle("Software Engineer Intern");
        drive.setJobDescription("Summer internship for final-year students.");
        drive.setRequiredTechStacks("[\"Java\", \"Spring Boot\", \"SQL\"]");
        drive.setMinimumScore(60.0);
        drive.setApplicationDeadline(LocalDateTime.now().plusDays(30));
        drive.setCreatedBy(admin);
        driveRepository.save(drive);

        Quiz quiz = new Quiz();
        quiz.setTitle("Java Fundamentals");
        quiz.setDescription("OOP, collections and exceptions basics.");
        quiz.setDurationMinutes(20);
        quiz.setTotalQuestions(10);
        quiz.setPassingScore(60.0);
        quiz.setCreatedBy(admin);
        quizRepository.save(quiz);

        log.info("Seeded demo data. Logins: admin / mentor1 / student1 (password: {})", DEMO_PASSWORD);
    }

    private User user(String username, String email, String role, String hash, boolean profileCompleted) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(hash);
        u.setRole(role);
        u.setActive(true);
        u.setProfileCompleted(profileCompleted);
        return userRepository.save(u);
    }
}
