package com.gigshield.repository;

import com.gigshield.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, UUID> {

    List<Policy> findByWorkerIdOrderByCreatedAtDesc(UUID workerId);

    List<Policy> findByStatus(String status);

    @Query("SELECT DISTINCT p.pincode FROM Policy p WHERE p.status = 'Active'")
    List<String> findDistinctActivePincodes();

    List<Policy> findByPincodeAndStatus(String pincode, String status);

    long countByStatus(String status);
}
