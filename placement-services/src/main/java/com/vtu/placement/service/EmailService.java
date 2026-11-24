package com.vtu.placement.service;

import com.vtu.placement.dto.EligibilityDtos.CriterionResult;
import com.vtu.placement.dto.EligibilityDtos.EligibilityResponse;
import com.vtu.placement.dto.NotificationDtos.DriveAnnouncementRequest;
import com.vtu.placement.dto.NotificationDtos.EmailRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

/**
 * E-mail notifications via Spring Mail (SMTP).
 *
 * Every public method is @Async: the HTTP request returns immediately (202) and the mail is sent on a
 * background thread. Because of this, failures cannot reach the caller, so they are logged here.
 *
 * VIVA NOTE: @Async works through a Spring proxy. A method calling another @Async method of the SAME
 * class bypasses the proxy and runs synchronously, so each public method calls the private deliver()
 * helper instead of calling send().
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    @Async
    public void send(EmailRequest request) {
        deliver(request.to(), request.subject(), request.body(), request.html());
    }

    /** Tells a student whether they are eligible for a drive, with a pass/fail checklist. */
    @Async
    public void sendEligibilityResult(String to, EligibilityResponse r) {
        String subject = (r.eligible() ? "You are eligible: " : "Eligibility update: ") + r.companyName();
        deliver(List.of(to), subject, buildEligibilityHtml(r), true);
    }

    /** Broadcasts a new drive to many students. */
    @Async
    public void sendDriveAnnouncement(DriveAnnouncementRequest req) {
        String html = "<h2>New Placement Drive: " + esc(req.companyName()) + "</h2>"
                + "<p><b>Role:</b> " + esc(req.role()) + "</p>"
                + "<p><b>Apply before:</b> " + esc(req.applicationDeadline()) + "</p>"
                + (req.details() == null ? "" : "<p>" + esc(req.details()) + "</p>")
                + "<p>Log in to the Placement Portal to check your eligibility and apply.</p>";
        deliver(req.recipients(), "New Drive: " + req.companyName(), html, true);
    }

    // ------------------------------------------------------------------ internals

    private void deliver(List<String> recipients, String subject, String body, boolean html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(recipients.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(body, html);
            mailSender.send(message);
            log.info("Mail '{}' sent to {} recipient(s)", subject, recipients.size());
        } catch (MessagingException | MailException e) {
            log.error("Failed to send mail '{}': {}", subject, e.getMessage());
        }
    }

    private String buildEligibilityHtml(EligibilityResponse r) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>").append(esc(r.companyName())).append(" - Eligibility Result</h2>")
          .append("<p>Hello ").append(esc(r.studentName())).append(",</p>")
          .append("<p><b>").append(esc(r.summary())).append("</b></p>")
          .append("<p>Readiness: ").append(r.readinessPercent()).append("%</p>")
          .append("<table border='1' cellpadding='6' style='border-collapse:collapse'>")
          .append("<tr><th>Criterion</th><th>Required</th><th>Your value</th><th>Status</th></tr>");
        for (CriterionResult c : r.checks()) {
            sb.append("<tr><td>").append(esc(c.criterion())).append("</td><td>").append(esc(c.required()))
              .append("</td><td>").append(esc(c.actual())).append("</td><td>")
              .append(c.passed() ? "Pass" : "Fail").append("</td></tr>");
        }
        sb.append("</table>");
        if (r.missingSkills() != null && !r.missingSkills().isEmpty()) {
            sb.append("<p>Skills to work on: ").append(esc(String.join(", ", r.missingSkills()))).append("</p>");
        }
        return sb.toString();
    }

    /** Escapes user-supplied text so it cannot inject HTML into the mail. */
    private String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s);
    }
}
