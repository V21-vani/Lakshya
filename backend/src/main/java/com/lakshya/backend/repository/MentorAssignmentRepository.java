package com.lakshya.backend.repository;

import com.lakshya.backend.model.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {

    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.student.id = :studentId ORDER BY ma.assignedAt DESC")
    List<MentorAssignment> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.mentor.id = :mentorId ORDER BY ma.assignedAt DESC")
    List<MentorAssignment> findByMentorId(@Param("mentorId") Long mentorId);

    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.drive.id = :driveId ORDER BY ma.assignedAt DESC")
    List<MentorAssignment> findByDriveId(@Param("driveId") Long driveId);

    @Query("SELECT ma FROM MentorAssignment ma WHERE ma.student.id = :studentId AND ma.drive.id = :driveId")
    Optional<MentorAssignment> findByStudentIdAndDriveId(
            @Param("studentId") Long studentId,
            @Param("driveId") Long driveId);
}