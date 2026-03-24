package com.gigshield.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String pincode;

    @Column
    private String platform;

    @Column(name = "weekly_earnings", nullable = false)
    private BigDecimal weeklyEarnings;

    @Column(name = "zone_risk_score")
    @Builder.Default
    private Integer zoneRiskScore = 0;

    @Column(name = "trust_tier")
    @Builder.Default
    private String trustTier = "New";

    @Column(name = "claim_count")
    @Builder.Default
    private Integer claimCount = 0;

    @Column(name = "is_admin")
    @Builder.Default
    private Boolean isAdmin = false;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
