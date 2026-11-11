package com.medishare.controller;

import com.medishare.entity.*;
import com.medishare.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class StockRequestController {

    private final StockRequestRepository requestRepository;
    private final MedicineBatchRepository batchRepository;
    private final TransferRepository transferRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    // ── My Requests ───────────────────────────────────────────
    @GetMapping("/requests/my")
    public ResponseEntity<?> getMyRequests(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<StockRequest> list = user.getOrganizationId() != null
                ? requestRepository.findByRequesterOrgId(user.getOrganizationId())
                : requestRepository.findByRequesterUserId(user.getId());
        return ResponseEntity.ok(list);
    }

    // ── Batch Requests ────────────────────────────────────────
    @GetMapping("/requests/batch/{batchId}")
    public ResponseEntity<?> getForBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(requestRepository.findByBatchId(batchId));
    }

    // ── Create Stock Request ──────────────────────────────────
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@AuthenticationPrincipal User user, @Valid @RequestBody CreateRequestDto req) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Must belong to an organization to request medicine"));
        }

        MedicineBatch batch = batchRepository.findById(req.getBatchId()).orElse(null);
        if (batch == null || batch.getStatus() != MedicineBatch.BatchStatus.APPROVED) {
            return ResponseEntity.badRequest().body(Map.of("message", "Medicine batch is not available for request"));
        }

        if (batch.getOrganizationId().equals(user.getOrganizationId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot request own organization's batch"));
        }

        if (req.getRequestedQuantity() > batch.getQuantity()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Requested quantity exceeds available stock (" + batch.getQuantity() + ")"));
        }

        StockRequest stockRequest = StockRequest.builder()
                .batchId(batch.getId())
                .requesterOrgId(user.getOrganizationId())
                .requesterUserId(user.getId())
                .requestedQuantity(req.getRequestedQuantity())
                .clinicalNote(req.getClinicalNote())
                .status(StockRequest.RequestStatus.PENDING)
                .build();

        StockRequest saved = requestRepository.save(stockRequest);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .action("REQUEST_CREATED")
                .entityType("StockRequest")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Requested " + saved.getRequestedQuantity() + " units of " + batch.getMedicineName())
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Cancel Request ────────────────────────────────────────
    @PostMapping("/requests/{id}/cancel")
    public ResponseEntity<?> cancelRequest(@AuthenticationPrincipal User user, @PathVariable Long id) {
        StockRequest req = requestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !req.getRequesterUserId().equals(user.getId()) &&
                !req.getRequesterOrgId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized"));
        }

        if (req.getStatus() != StockRequest.RequestStatus.PENDING) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only pending requests can be cancelled"));
        }

        req.setStatus(StockRequest.RequestStatus.CANCELLED);
        StockRequest saved = requestRepository.save(req);

        auditLogRepository.save(AuditLog.builder()
                .action("REQUEST_CANCELLED")
                .entityType("StockRequest")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Request cancelled by requester")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    // ── Admin: Pending Requests ───────────────────────────────
    @GetMapping("/admin/requests/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingRequests() {
        return ResponseEntity.ok(requestRepository.findByStatus(StockRequest.RequestStatus.PENDING));
    }

    // ── Admin: Review Request ─────────────────────────────────
    @PostMapping("/admin/requests/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewRequest(@AuthenticationPrincipal User admin, @PathVariable Long id, @RequestBody Map<String, String> body) {
        StockRequest req = requestRepository.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();

        String statusStr = body.get("status");
        String adminNote = body.get("adminNote");

        StockRequest.RequestStatus newStatus = StockRequest.RequestStatus.valueOf(statusStr);
        req.setStatus(newStatus);
        req.setAdminNote(adminNote);
        req.setReviewedBy(admin != null ? admin.getId() : null);
        req.setReviewedAt(LocalDateTime.now());

        StockRequest saved = requestRepository.save(req);

        // If APPROVED, create Transfer and update batch stock
        if (newStatus == StockRequest.RequestStatus.APPROVED) {
            MedicineBatch batch = batchRepository.findById(saved.getBatchId()).orElse(null);
            if (batch != null) {
                int newQty = Math.max(0, batch.getQuantity() - saved.getRequestedQuantity());
                batch.setQuantity(newQty);
                batchRepository.save(batch);

                Transfer transfer = Transfer.builder()
                        .requestId(saved.getId())
                        .batchId(saved.getBatchId())
                        .donorOrgId(batch.getOrganizationId())
                        .recipientOrgId(saved.getRequesterOrgId())
                        .quantity(saved.getRequestedQuantity())
                        .status(Transfer.TransferStatus.APPROVED)
                        .trackingId("TRK-" + System.currentTimeMillis())
                        .temperatureStatus(Transfer.TemperatureStatus.COMPLIANT)
                        .build();
                transferRepository.save(transfer);

                // Send notification
                notificationRepository.save(Notification.builder()
                        .userId(saved.getRequesterUserId())
                        .title("Transfer Approved")
                        .message("Your request for " + batch.getMedicineName() + " has been approved and transfer created.")
                        .type(Notification.NotificationType.REQUEST_APPROVED)
                        .isRead(false)
                        .build());
            }
        }

        auditLogRepository.save(AuditLog.builder()
                .action("REQUEST_REVIEWED")
                .entityType("StockRequest")
                .entityId(saved.getId())
                .userId(admin != null ? admin.getId() : null)
                .userName(admin != null ? admin.getFullName() : "Admin")
                .userRole("ADMIN")
                .details("Request status set to " + newStatus)
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @Data
    public static class CreateRequestDto {
        @NotNull private Long batchId;
        @NotNull @Min(1) private Integer requestedQuantity;
        private String clinicalNote;
    }
}

