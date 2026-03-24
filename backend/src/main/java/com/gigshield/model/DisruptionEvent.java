package com.gigshield.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "disruption_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisruptionEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false)
    private String pincode;

    @Column(name = "trigger_type", nullable = false)
    private String triggerType;

    @Column(name = "trigger_value", nullable = false)
    private String triggerValue;

    @Column(name = "affected_workers")
    @Builder.Default
    private Integer affectedWorkers = 0;

    @Column(name = "claims_created")
    @Builder.Default
    private Integer claimsCreated = 0;

    @Column(name = "detected_at")
    @Builder.Default
    private OffsetDateTime detectedAt = OffsetDateTime.now();
}
