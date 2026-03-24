package com.gigshield.service;

import com.gigshield.util.PincodeZoneMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.Random;

@Service
public class AqiService {

    private static final Logger log = LoggerFactory.getLogger(AqiService.class);
    private final WebClient aqiWebClient;
    private final String apiKey;
    private final Random random = new Random();

    public AqiService(@Qualifier("aqiWebClient") WebClient aqiWebClient,
                      @Value("${aqicn.api-key}") String apiKey) {
        this.aqiWebClient = aqiWebClient;
        this.apiKey = apiKey;
    }

    /**
     * Get current AQI for a pincode.
     * Returns AQI value (0-500+). Falls back to mock data if API key is missing.
     */
    public int getAqi(String pincode) {
        PincodeZoneMap.ZoneInfo zone = PincodeZoneMap.getZone(pincode);

        if ("demo".equals(apiKey) || apiKey == null || apiKey.isBlank()) {
            log.info("Using mock AQI data for pincode {} (no API key)", pincode);
            return getMockAqi(zone);
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = aqiWebClient.get()
                    .uri("/feed/geo:{lat};{lon}/?token={token}",
                            zone.getLatitude(), zone.getLongitude(), apiKey)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !"ok".equals(response.get("status"))) {
                log.warn("AQI API returned invalid response for pincode {}", pincode);
                return getMockAqi(zone);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data != null && data.containsKey("aqi")) {
                int aqi = ((Number) data.get("aqi")).intValue();
                log.info("AQI for {} ({}): {}", pincode, zone.getCity(), aqi);
                return aqi;
            }

            return getMockAqi(zone);

        } catch (Exception e) {
            log.error("AQI API call failed for pincode {}: {}", pincode, e.getMessage());
            return getMockAqi(zone);
        }
    }

    private int getMockAqi(PincodeZoneMap.ZoneInfo zone) {
        // Generate mock AQI based on city risk profile
        int baseAqi = switch (zone.getCity()) {
            case "Delhi" -> 200 + random.nextInt(200);
            case "Mumbai" -> 100 + random.nextInt(150);
            case "Kolkata" -> 120 + random.nextInt(180);
            case "Chennai" -> 60 + random.nextInt(120);
            case "Bangalore" -> 40 + random.nextInt(100);
            default -> 80 + random.nextInt(150);
        };
        return Math.min(500, baseAqi);
    }
}
