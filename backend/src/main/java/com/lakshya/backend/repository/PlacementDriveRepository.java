package com.lakshya.backend.repository;

import com.lakshya.backend.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {

    @Query("SELECT pd FROM PlacementDrive pd WHERE pd.companyName = :companyName AND pd.isActive = true")
    Optional<PlacementDrive> findByCompanyName(@Param("companyName") String companyName);

    @Query("SELECT pd FROM PlacementDrive pd WHERE pd.isActive = true ORDER BY pd.createdAt DESC")
    List<PlacementDrive> findAllActiveOrderByCreatedDesc();

    @Query("SELECT pd FROM PlacementDrive pd WHERE pd.createdBy.id = :userId")
    List<PlacementDrive> findByCreatorId(@Param("userId") Long userId);
}