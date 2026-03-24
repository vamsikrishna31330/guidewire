package com.gigshield.dto;

import lombok.Data;
import java.util.Map;

@Data
public class PremiumQuoteResponse {
    private double weeklyPremium;
    private int riskScore;
    private Map<String, Double> breakdown;
}
