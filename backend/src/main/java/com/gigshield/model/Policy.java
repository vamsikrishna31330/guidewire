package com.gigshield.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "worker_id", nullable = false)
    private UUID workerId;

    @Column(nullable = false)
    private String pincode;

    @Column(name = "weekly_premium", nullable = false)
    private BigDecimal weeklyPremium;

    @Column(name = "coverage_types", columnDefinition = "text[]")
    private String[] coverageTypes;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column
    @Builder.Default
    private String status = "Active";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
