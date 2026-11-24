package com.vtu.placement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Entry point of Member 2's module.
 *
 * @EnableAsync                 lets @Async methods (e-mail sending) run on a background thread
 *                              so the HTTP response is not blocked by the slow SMTP server.
 * @ConfigurationPropertiesScan registers Judge0Properties, which binds the "judge0.*" keys
 *                              from application.properties.
 */
@SpringBootApplication
@EnableAsync
@ConfigurationPropertiesScan
public class PlacementServicesApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlacementServicesApplication.class, args);
    }
}
