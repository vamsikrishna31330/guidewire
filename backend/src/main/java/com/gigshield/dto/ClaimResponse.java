package com.gigshield.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ClaimResponse {
    private UUID id;
    private UUID policyId;
    private String triggerType;
    private String triggerValue;
    private String pincode;
    private String status;
    private BigDecimal payoutAmount;
    private Boolean isAutomatic;
    private OffsetDateTime detectedAt;
    private OffsetDateTime createdAt;
}
