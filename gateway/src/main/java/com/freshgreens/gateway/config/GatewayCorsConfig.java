package com.freshgreens.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global CORS policy applied at the gateway level.
 *
 * In production both frontends (customer-portal, admin-console) send requests
 * directly to the gateway — no Vite dev-proxy is involved — so the gateway must
 * respond with the correct Access-Control-* headers.
 */
@Configuration
public class GatewayCorsConfig {

    @Value("${app.cors.allowed-origins:}")
    private String extraOrigins;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Localhost dev origins (Vite dev-servers + gateway itself)
        List<String> origins = new ArrayList<>(List.of(
                "http://localhost:8080",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175"
        ));

        // Production / Cloud Run origins injected via env var (comma-separated)
        if (extraOrigins != null && !extraOrigins.isBlank()) {
            origins.addAll(
                    List.of(extraOrigins.split(","))
                            .stream()
                            .map(String::trim)
                            .filter(o -> !o.isBlank())
                            .collect(Collectors.toList())
            );
        }

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
