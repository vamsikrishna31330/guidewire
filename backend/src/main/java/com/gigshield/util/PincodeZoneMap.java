package com.gigshield.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

/**
 * Static mapping of Indian pincodes to geographic coordinates and risk scores.
 * Used by WeatherService, AqiService, and TriggerEngineService.
 */
public class PincodeZoneMap {

    @Data
    @AllArgsConstructor
    public static class ZoneInfo {
        private double latitude;
        private double longitude;
        private int riskScore;
        private String city;
    }

    private static final Map<String, ZoneInfo> ZONE_MAP = new HashMap<>();

    static {
        ZONE_MAP.put("500001", new ZoneInfo(17.3850, 78.4867, 72, "Hyderabad"));
        ZONE_MAP.put("600001", new ZoneInfo(13.0827, 80.2707, 68, "Chennai"));
        ZONE_MAP.put("400001", new ZoneInfo(19.0760, 72.8777, 80, "Mumbai"));
        ZONE_MAP.put("110001", new ZoneInfo(28.6139, 77.2090, 65, "Delhi"));
        ZONE_MAP.put("560001", new ZoneInfo(12.9716, 77.5946, 55, "Bangalore"));
        ZONE_MAP.put("700001", new ZoneInfo(22.5726, 88.3639, 78, "Kolkata"));
        ZONE_MAP.put("411001", new ZoneInfo(18.5204, 73.8567, 60, "Pune"));
        ZONE_MAP.put("530001", new ZoneInfo(17.6868, 83.2185, 70, "Visakhapatnam"));
        ZONE_MAP.put("522001", new ZoneInfo(16.3067, 80.4365, 74, "Guntur"));
        ZONE_MAP.put("521001", new ZoneInfo(16.5062, 80.6480, 71, "Vijayawada"));
    }

    public static ZoneInfo getZone(String pincode) {
        return ZONE_MAP.getOrDefault(pincode,
                new ZoneInfo(20.5937, 78.9629, 65, "Unknown")); // India center fallback
    }

    public static Map<String, ZoneInfo> getAllZones() {
        return ZONE_MAP;
    }

    public static boolean isKnownPincode(String pincode) {
        return ZONE_MAP.containsKey(pincode);
    }
}
