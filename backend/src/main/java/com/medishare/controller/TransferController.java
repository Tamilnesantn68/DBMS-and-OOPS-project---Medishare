package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.entity.Transfer;
import com.medishare.entity.User;
import com.medishare.repository.AuditLogRepository;
import com.medishare.repository.TransferRepository;
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
public class TransferController {

    private final TransferRepository transferRepository;
    private final AuditLogRepository auditLogRepository;

    // ── My Transfers ──────────────────────────────────────────
    @GetMapping("/transfers/my")
    public ResponseEntity<?> getMyTransfers(@AuthenticationPrincipal User user) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Transfer> transfers = transferRepository.findByDonorOrgIdOrRecipientOrgId(
                user.getOrganizationId(), user.getOrganizationId()
        );
        return ResponseEntity.ok(transfers);
    }

    // ── Admin: All Transfers ──────────────────────────────────
    @GetMapping("/admin/transfers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTransfers() {
        return ResponseEntity.ok(transferRepository.findAll());
    }

    // ── Dispatch Transfer (Donor) ─────────────────────────────
    @PostMapping("/transfers/{id}/dispatch")
    public ResponseEntity<?> dispatchTransfer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Transfer transfer = transferRepository.findById(id).orElse(null);
        if (transfer == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !transfer.getDonorOrgId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only donor organization can dispatch transfer"));
        }

        String trackingId = body.getOrDefault("trackingId", "TRK-" + System.currentTimeMillis());
        transfer.setStatus(Transfer.TransferStatus.IN_TRANSIT);
        transfer.setTrackingId(trackingId);
        transfer.setDispatchedAt(LocalDateTime.now());

        Transfer saved = transferRepository.save(transfer);

        auditLogRepository.save(AuditLog.builder()
                .action("TRANSFER_DISPATCHED")
                .entityType("Transfer")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Transfer dispatched with tracking ID: " + trackingId)
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    // ── Confirm Receipt (Recipient) ───────────────────────────
    @PostMapping("/transfers/{id}/confirm-receipt")
    public ResponseEntity<?> confirmReceipt(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Transfer transfer = transferRepository.findById(id).orElse(null);
        if (transfer == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !transfer.getRecipientOrgId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only recipient organization can confirm receipt"));
        }

        String receiptNote = body.get("receiptNote");
        String tempStatus = body.getOrDefault("temperatureStatus", "COMPLIANT");

        transfer.setStatus(Transfer.TransferStatus.RECEIPT_CONFIRMED);
        transfer.setReceiptNote(receiptNote);
        transfer.setTemperatureStatus(Transfer.TemperatureStatus.valueOf(tempStatus));
        transfer.setDeliveredAt(LocalDateTime.now());
        transfer.setConfirmedAt(LocalDateTime.now());

        Transfer saved = transferRepository.save(transfer);

        auditLogRepository.save(AuditLog.builder()
                .action("TRANSFER_RECEIPT_CONFIRMED")
                .entityType("Transfer")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Transfer receipt confirmed. Temperature: " + tempStatus)
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }
}

