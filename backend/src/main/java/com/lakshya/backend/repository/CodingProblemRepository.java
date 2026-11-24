package com.lakshya.backend.repository;

import com.lakshya.backend.model.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {

    @Query("SELECT cp FROM CodingProblem cp WHERE cp.topic = :topic AND cp.isActive = true")
    List<CodingProblem> findByTopic(@Param("topic") String topic);

    @Query("SELECT cp FROM CodingProblem cp WHERE cp.difficulty = :difficulty AND cp.isActive = true")
    List<CodingProblem> findByDifficulty(@Param("difficulty") String difficulty);

    @Query("SELECT cp FROM CodingProblem cp WHERE cp.isActive = true ORDER BY cp.createdAt DESC")
    List<CodingProblem> findAllActiveOrderByCreatedDesc();

    @Query("SELECT cp FROM CodingProblem cp WHERE cp.createdBy.id = :userId ORDER BY cp.createdAt DESC")
    List<CodingProblem> findByCreatorId(@Param("userId") Long userId);
}