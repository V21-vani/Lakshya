package com.vtu.placement.exception;

import com.vtu.placement.dto.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Converts exceptions into clean JSON errors. Controllers stay free of try/catch blocks.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Bean-validation failure (@Valid) -> 400 with a list of field problems. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest()
                .body(ApiError.of(400, "Bad Request", "Validation failed", details));
    }

    /** Business-rule violation such as an unsupported language -> 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(ApiError.of(400, "Bad Request", ex.getMessage(), List.of()));
    }

    /** Judge0 down / timed out -> 502 Bad Gateway (our server is fine, the upstream is not). */
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ApiError> handleExternal(ExternalServiceException ex) {
        log.error("External service failure", ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiError.of(502, "Bad Gateway", ex.getMessage(), List.of()));
    }

    /** Safety net: never leak stack traces to clients. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(500, "Internal Server Error", "Unexpected error occurred", List.of()));
    }
}
