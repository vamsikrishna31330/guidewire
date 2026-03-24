package com.gigshield.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "worker_id", nullable = false)
    private UUID workerId;

    @Column(name = "policy_id")
    private UUID policyId;

    @Column(name = "trigger_type", nullable = false)
    private String triggerType;

    @Column(name = "trigger_value", nullable = false)
    private String triggerValue;

    @Column(nullable = false)
    private String pincode;

    @Column
    @Builder.Default
    private String status = "Pending";

    @Column(name = "payout_amount")
    private BigDecimal payoutAmount;

    @Column(name = "is_automatic")
    @Builder.Default
    private Boolean isAutomatic = false;

    @Column(name = "detected_at")
    private OffsetDateTime detectedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
