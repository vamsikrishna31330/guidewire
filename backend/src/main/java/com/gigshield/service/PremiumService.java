package com.gigshield.service;

import com.gigshield.dto.PremiumQuoteRequest;
import com.gigshield.dto.PremiumQuoteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class PremiumService {

    private static final Logger log = LoggerFactory.getLogger(PremiumService.class);
    private final WebClient mlWebClient;

    public PremiumService(@Qualifier("mlWebClient") WebClient mlWebClient) {
        this.mlWebClient = mlWebClient;
    }

    /**
     * Calls the Python ML microservice to calculate premium.
     * Falls back to a formula-based calculation if the ML service is unavailable.
     */
    public PremiumQuoteResponse calculatePremium(PremiumQuoteRequest request) {
        try {
            // Build request body matching Python schema
            Map<String, Object> body = new HashMap<>();
            body.put("pincode", request.getPincode());
            body.put("current_season", request.getCurrentSeason());
            body.put("aqi_7day_avg", request.getAqi7dayAvg());
            body.put("rain_7day_avg_mm", request.getRain7dayAvgMm());
            body.put("worker_claim_history", request.getWorkerClaimHistory());
            body.put("worker_trust_tier", request.getWorkerTrustTier());

            @SuppressWarnings("unchecked")
            Map<String, Object> mlResponse = mlWebClient.post()
                    .uri("/api/premium/calculate")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (mlResponse == null) {
                log.warn("ML service returned null, using fallback");
                return fallbackCalculation(request);
            }

            PremiumQuoteResponse response = new PremiumQuoteResponse();
            response.setWeeklyPremium(((Number) mlResponse.get("weekly_premium")).doubleValue());
            response.setRiskScore(((Number) mlResponse.get("risk_score")).intValue());

            @SuppressWarnings("unchecked")
            Map<String, Object> rawBreakdown = (Map<String, Object>) mlResponse.get("breakdown");
            Map<String, Double> breakdown = new HashMap<>();
            if (rawBreakdown != null) {
                rawBreakdown.forEach((k, v) -> breakdown.put(k, ((Number) v).doubleValue()));
            }
            response.setBreakdown(breakdown);

            log.info("Premium calculated via ML: ₹{}, risk={}", response.getWeeklyPremium(), response.getRiskScore());
            return response;

        } catch (Exception e) {
            log.error("ML service call failed: {}", e.getMessage());
            return fallbackCalculation(request);
        }
    }

    private PremiumQuoteResponse fallbackCalculation(PremiumQuoteRequest request) {
        log.info("Using fallback premium calculation for pincode {}", request.getPincode());

        double zoneFactor = 0.30;
        double weatherFactor = Math.min(request.getAqi7dayAvg() / 500, 1.0) * 0.15
                + Math.min(request.getRain7dayAvgMm() / 100, 1.0) * 0.15;
        double historyFactor = Math.min(request.getWorkerClaimHistory() / 5.0, 1.0) * 0.15;
        double trustDiscount = switch (request.getWorkerTrustTier()) {
            case "Standard" -> -0.05;
            case "Verified" -> -0.10;
            default -> 0.0;
        };

        double multiplier = zoneFactor + weatherFactor + historyFactor + trustDiscount;
        double premium = Math.round((15 + 65 * Math.max(0, Math.min(multiplier, 1.0))) * 100.0) / 100.0;
        int riskScore = (int) Math.min(100, Math.max(0, multiplier * 100));

        PremiumQuoteResponse response = new PremiumQuoteResponse();
        response.setWeeklyPremium(premium);
        response.setRiskScore(riskScore);
        response.setBreakdown(Map.of(
                "zone_factor", zoneFactor,
                "weather_factor", weatherFactor,
                "history_factor", historyFactor,
                "trust_discount", trustDiscount
        ));

        return response;
    }
}
