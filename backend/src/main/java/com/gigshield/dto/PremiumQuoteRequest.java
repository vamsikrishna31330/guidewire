package com.gigshield.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PremiumQuoteRequest {
    @NotBlank private String pincode;
    @NotBlank private String currentSeason;
    @NotNull private Double aqi7dayAvg;
    @NotNull private Double rain7dayAvgMm;
    private int workerClaimHistory;
    private String workerTrustTier = "New";
}
