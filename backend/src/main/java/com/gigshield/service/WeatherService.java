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
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    private final WebClient weatherWebClient;
    private final String apiKey;
    private final Random random = new Random();

    public WeatherService(@Qualifier("weatherWebClient") WebClient weatherWebClient,
                          @Value("${openweather.api-key}") String apiKey) {
        this.weatherWebClient = weatherWebClient;
        this.apiKey = apiKey;
    }

    /**
     * Get current weather data for a pincode.
     * Returns a map with keys: "rain_3h" (mm), "temp" (°C), "humidity" (%)
     * Falls back to mock data if API key is missing or call fails.
     */
    public Map<String, Double> getWeatherData(String pincode) {
        PincodeZoneMap.ZoneInfo zone = PincodeZoneMap.getZone(pincode);

        if ("demo".equals(apiKey) || apiKey == null || apiKey.isBlank()) {
            log.info("Using mock weather data for pincode {} (no API key)", pincode);
            return getMockWeatherData(zone);
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = weatherWebClient.get()
                    .uri("/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric",
                            zone.getLatitude(), zone.getLongitude(), apiKey)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                log.warn("Weather API returned null for pincode {}", pincode);
                return getMockWeatherData(zone);
            }

            double rain3h = 0.0;
            if (response.containsKey("rain")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> rain = (Map<String, Object>) response.get("rain");
                if (rain != null && rain.containsKey("3h")) {
                    rain3h = ((Number) rain.get("3h")).doubleValue();
                } else if (rain != null && rain.containsKey("1h")) {
                    rain3h = ((Number) rain.get("1h")).doubleValue() * 3;
                }
            }

            double temp = 30.0;
            if (response.containsKey("main")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                if (main != null) {
                    temp = ((Number) main.getOrDefault("temp", 30.0)).doubleValue();
                }
            }

            double humidity = 50.0;
            if (response.containsKey("main")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> main = (Map<String, Object>) response.get("main");
                if (main != null) {
                    humidity = ((Number) main.getOrDefault("humidity", 50)).doubleValue();
                }
            }

            log.info("Weather for {} ({}): rain={}mm/3h, temp={}°C, humidity={}%",
                    pincode, zone.getCity(), rain3h, temp, humidity);

            return Map.of(
                    "rain_3h", rain3h,
                    "temp", temp,
                    "humidity", humidity
            );

        } catch (Exception e) {
            log.error("Weather API call failed for pincode {}: {}", pincode, e.getMessage());
            return getMockWeatherData(zone);
        }
    }

    private Map<String, Double> getMockWeatherData(PincodeZoneMap.ZoneInfo zone) {
        // Generate realistic mock data based on risk score
        double riskFactor = zone.getRiskScore() / 100.0;
        double rain = random.nextDouble() < riskFactor * 0.5 ?
                5 + random.nextDouble() * 25 * riskFactor : random.nextDouble() * 5;
        double temp = 25 + random.nextDouble() * 20;
        double humidity = 40 + random.nextDouble() * 50;

        return Map.of(
                "rain_3h", Math.round(rain * 100.0) / 100.0,
                "temp", Math.round(temp * 10.0) / 10.0,
                "humidity", Math.round(humidity * 10.0) / 10.0
        );
    }
}
