package com.vtu.placement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Type-safe binding of the "judge0.*" properties.
 * Using a record keeps the configuration immutable (good practice: config never changes at runtime).
 */
@ConfigurationProperties(prefix = "judge0")
public record Judge0Properties(
        @DefaultValue("https://ce.judge0.com") String baseUrl,
        String apiKey,
        @DefaultValue("judge0-ce.p.rapidapi.com") String apiHost,
        @DefaultValue("30") int timeoutSeconds) {
}
