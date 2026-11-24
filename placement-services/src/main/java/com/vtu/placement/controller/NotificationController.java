package com.vtu.placement.controller;

import com.vtu.placement.dto.NotificationDtos.DriveAnnouncementRequest;
import com.vtu.placement.dto.NotificationDtos.EligibilityNotificationRequest;
import com.vtu.placement.dto.NotificationDtos.EmailRequest;
import com.vtu.placement.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** All endpoints answer 202 Accepted: the mail is queued and sent in the background (@Async). */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.send(request);
        return accepted();
    }

    @PostMapping("/eligibility-result")
    public ResponseEntity<Map<String, String>> sendEligibility(@Valid @RequestBody EligibilityNotificationRequest request) {
        emailService.sendEligibilityResult(request.to(), request.result());
        return accepted();
    }

    @PostMapping("/drive-announcement")
    public ResponseEntity<Map<String, String>> announceDrive(@Valid @RequestBody DriveAnnouncementRequest request) {
        emailService.sendDriveAnnouncement(request);
        return accepted();
    }

    private ResponseEntity<Map<String, String>> accepted() {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("status", "QUEUED"));
    }
}
