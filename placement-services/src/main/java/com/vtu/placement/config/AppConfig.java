package com.vtu.placement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Central place for beans that other classes inject.
 */
@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    /**
     * Pre-configured HTTP client for Judge0.
     * If an API key is supplied (RapidAPI hosting) the auth headers are added automatically;
     * the public ce.judge0.com instance needs no key.
     */
    @Bean
    public WebClient judge0WebClient(Judge0Properties props) {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        if (props.apiKey() != null && !props.apiKey().isBlank()) {
            builder.defaultHeader("X-RapidAPI-Key", props.apiKey());
            builder.defaultHeader("X-RapidAPI-Host", props.apiHost());
        }
        return builder.build();
    }

    /** Allows the React front-end (Members 3 and 4) to call this service from the browser. */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
