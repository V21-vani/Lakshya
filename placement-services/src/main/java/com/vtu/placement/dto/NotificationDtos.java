package com.vtu.placement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Contracts for the e-mail notification API. */
public final class NotificationDtos {
    private NotificationDtos() {}

    /** Generic mail. Set html=true if the body contains HTML tags. */
    public record EmailRequest(@NotEmpty List<@Email String> to,
                               @NotBlank String subject,
                               @NotBlank String body,
                               boolean html) {}

    /** Mails a student the outcome of an eligibility check. */
    public record EligibilityNotificationRequest(@NotBlank @Email String to,
                                                 @Valid @NotNull EligibilityDtos.EligibilityResponse result) {}

    /** Announces a new hiring drive to many students at once. */
    public record DriveAnnouncementRequest(@NotEmpty List<@Email String> recipients,
                                           @NotBlank String companyName,
                                           @NotBlank String role,
                                           @NotBlank String applicationDeadline,
                                           String details) {}
}
