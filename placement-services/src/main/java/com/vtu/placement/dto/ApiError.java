package com.vtu.placement.dto;

import java.time.Instant;
import java.util.List;

/** Uniform error body so the front-end can handle every failure the same way. */
public record ApiError(Instant timestamp, int status, String error, String message, List<String> details) {
    public static ApiError of(int status, String error, String message, List<String> details) {
        return new ApiError(Instant.now(), status, error, message, details);
    }
}
