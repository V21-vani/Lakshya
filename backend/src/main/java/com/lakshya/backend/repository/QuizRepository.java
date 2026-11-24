package com.lakshya.backend.repository;

import com.lakshya.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query("SELECT q FROM Quiz q WHERE q.isActive = true ORDER BY q.createdAt DESC")
    List<Quiz> findAllActive();

    @Query("SELECT q FROM Quiz q WHERE q.createdBy.id = :userId")
    List<Quiz> findByCreatorId(@Param("userId") Long userId);

    @Query("SELECT q FROM Quiz q WHERE q.title = :title")
    Optional<Quiz> findByTitle(@Param("title") String title);
}