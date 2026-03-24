package com.gigshield.service;

import com.gigshield.model.DisruptionEvent;
import com.gigshield.repository.DisruptionEventRepository;
import com.gigshield.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TriggerEngineService {

    private static final Logger log = LoggerFactory.getLogger(TriggerEngineService.class);
    private final PolicyRepository policyRepository;
    private final DisruptionEventRepository disruptionEventRepository;
    private final WeatherService weatherService;
    private final AqiService aqiService;
    private final ClaimsService claimsService;

    // Trigger thresholds
    private static final double RAIN_THRESHOLD_MM = 15.0;  // 15mm/3h
    private static final double HEAT_THRESHOLD_C = 42.0;   // 42°C
    private static final int AQI_THRESHOLD = 300;           // AQI > 300

    // Deduplication window: 6 hours
    private static final int DEDUP_HOURS = 6;

    /**
     * Scheduled trigger engine — runs every 30 minutes.
     * Checks weather and AQI for all active policy pincodes.
     */
    @Scheduled(cron = "${trigger.cron}")
    public void checkTriggers() {
        log.info("⏰ Trigger Engine running...");

        List<String> activePincodes = policyRepository.findDistinctActivePincodes();
        if (activePincodes.isEmpty()) {
            log.info("No active pincodes found, skipping trigger check");
            return;
        }

        log.info("Checking {} active pincodes: {}", activePincodes.size(), activePincodes);

        int totalTriggered = 0;
        for (String pincode : activePincodes) {
            totalTriggered += checkPincode(pincode);
        }

        log.info("⏰ Trigger Engine complete. {} triggers fired.", totalTriggered);
    }

    /**
     * Manual trigger fire (admin-initiated, e.g. curfew or flood).
     */
    public DisruptionEvent manualTrigger(String pincode, String triggerType, String triggerValue) {
        log.info("🔥 Manual trigger: {} at pincode {} ({})", triggerType, pincode, triggerValue);
        return fireTrigger(pincode, triggerType, triggerValue);
    }

    private int checkPincode(String pincode) {
        int triggered = 0;

        // Check weather
        try {
            Map<String, Double> weather = weatherService.getWeatherData(pincode);
            double rain3h = weather.getOrDefault("rain_3h", 0.0);
            double temp = weather.getOrDefault("temp", 30.0);

            // Rain trigger
            if (rain3h > RAIN_THRESHOLD_MM) {
                if (!isDuplicate(pincode, "rain")) {
                    fireTrigger(pincode, "rain", String.format("%.1fmm rain in 3h", rain3h));
                    triggered++;
                }
            }

            // Heat trigger
            if (temp > HEAT_THRESHOLD_C) {
                if (!isDuplicate(pincode, "heat")) {
                    fireTrigger(pincode, "heat", String.format("%.1f°C temperature", temp));
                    triggered++;
                }
            }
        } catch (Exception e) {
            log.error("Weather check failed for pincode {}: {}", pincode, e.getMessage());
        }

        // Check AQI
        try {
            int aqi = aqiService.getAqi(pincode);
            if (aqi > AQI_THRESHOLD) {
                if (!isDuplicate(pincode, "aqi")) {
                    fireTrigger(pincode, "aqi", String.format("AQI %d detected", aqi));
                    triggered++;
                }
            }
        } catch (Exception e) {
            log.error("AQI check failed for pincode {}: {}", pincode, e.getMessage());
        }

        return triggered;
    }

    private boolean isDuplicate(String pincode, String triggerType) {
        OffsetDateTime sixHoursAgo = OffsetDateTime.now().minusHours(DEDUP_HOURS);
        boolean duplicate = disruptionEventRepository
                .existsByPincodeAndTriggerTypeAndDetectedAtAfter(pincode, triggerType, sixHoursAgo);
        if (duplicate) {
            log.debug("Skipping duplicate trigger: {} at {} (within {}h window)", triggerType, pincode, DEDUP_HOURS);
        }
        return duplicate;
    }

    private DisruptionEvent fireTrigger(String pincode, String triggerType, String triggerValue) {
        // Create claims for affected workers
        int claimsCreated = claimsService.autoCreateClaims(pincode, triggerType, triggerValue);

        // Count affected workers (same as active policies in that pincode)
        int affectedWorkers = policyRepository.findByPincodeAndStatus(pincode, "Active").size();

        // Record the disruption event
        DisruptionEvent event = DisruptionEvent.builder()
                .pincode(pincode)
                .triggerType(triggerType)
                .triggerValue(triggerValue)
                .affectedWorkers(affectedWorkers)
                .claimsCreated(claimsCreated)
                .detectedAt(OffsetDateTime.now())
                .build();

        DisruptionEvent saved = disruptionEventRepository.save(event);
        log.info("🚨 Trigger fired: {} at {} — {} claims created for {} workers",
                triggerType, pincode, claimsCreated, affectedWorkers);

        return saved;
    }
}
