package com.lakshya.backend.repository;

import com.lakshya.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    @Query("SELECT a FROM Application a WHERE a.student.id = :studentId ORDER BY a.appliedAt DESC")
    List<Application> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Application a WHERE a.placementDrive.id = :driveId ORDER BY a.appliedAt DESC")
    List<Application> findByPlacementDriveId(@Param("driveId") Long driveId);

    @Query("SELECT a FROM Application a WHERE a.status = :status ORDER BY a.appliedAt DESC")
    List<Application> findByStatus(@Param("status") String status);

    @Query("SELECT a FROM Application a WHERE a.placementDrive.companyName = :companyName")
    List<Application> findByCompanyName(@Param("companyName") String companyName);
}