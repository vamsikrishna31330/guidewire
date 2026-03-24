package com.gigshield.repository;

import com.gigshield.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClaimsRepository extends JpaRepository<Claim, UUID> {

    List<Claim> findByWorkerIdOrderByCreatedAtDesc(UUID workerId);

    List<Claim> findByStatus(String status);

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(c.payoutAmount), 0) FROM Claim c WHERE c.status = 'Paid'")
    BigDecimal sumPaidPayouts();
}
