package com.lakshya.backend.repository;

import com.lakshya.backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.student.id = :studentId ORDER BY qa.completedAt DESC")
    List<QuizAttempt> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId ORDER BY qa.completedAt DESC")
    List<QuizAttempt> findByQuizId(@Param("quizId") Long quizId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.student.id = :studentId AND qa.quiz.id = :quizId")
    Optional<QuizAttempt> findByStudentIdAndQuizId(
            @Param("studentId") Long studentId,
            @Param("quizId") Long quizId);
}