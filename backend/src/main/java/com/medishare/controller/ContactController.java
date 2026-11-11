package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.entity.ContactMessage;
import com.medishare.repository.AuditLogRepository;
import com.medishare.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageRepository contactMessageRepository;
    private final AuditLogRepository auditLogRepository;

    @PostMapping("/contact")
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactRequest req) {
        ContactMessage msg = ContactMessage.builder()
                .name(req.getName())
                .email(req.getEmail())
                .subject(req.getSubject())
                .message(req.getMessage())
                .build();

        ContactMessage saved = contactMessageRepository.save(msg);

        auditLogRepository.save(AuditLog.builder()
                .action("CONTACT_SUBMISSION")
                .entityType("ContactMessage")
                .entityId(saved.getId())
                .userName(saved.getName())
                .userRole("GUEST")
                .details("Inquiry received: " + (saved.getSubject() != null ? saved.getSubject() : "General"))
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Thank you " + req.getName() + ", your message was received."));
    }

    @Data
    public static class ContactRequest {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        private String subject;
        @NotBlank private String message;
    }
}

