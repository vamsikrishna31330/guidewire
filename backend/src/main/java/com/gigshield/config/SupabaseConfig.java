package com.gigshield.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class SupabaseConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @Bean
    public WebClient supabaseWebClient() {
        return WebClient.builder()
                .baseUrl(supabaseUrl)
                .defaultHeader("apikey", supabaseServiceKey)
                .defaultHeader("Authorization", "Bearer " + supabaseServiceKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean
    public WebClient mlWebClient() {
        return WebClient.builder()
                .baseUrl(mlServiceUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean
    public WebClient weatherWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.openweathermap.org")
                .build();
    }

    @Bean
    public WebClient aqiWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.waqi.info")
                .build();
    }
}
