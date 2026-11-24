package com.vtu.placement.exception;

/** Thrown when a third-party service (Judge0) is unreachable or returns an error. Mapped to HTTP 502. */
public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
