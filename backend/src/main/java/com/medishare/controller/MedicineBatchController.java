package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.entity.MedicineBatch;
import com.medishare.entity.Organization;
import com.medishare.entity.User;
import com.medishare.repository.AuditLogRepository;
import com.medishare.repository.MedicineBatchRepository;
import com.medishare.repository.OrganizationRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class MedicineBatchController {

    private final MedicineBatchRepository batchRepository;
    private final OrganizationRepository orgRepository;
    private final AuditLogRepository auditLogRepository;

    // ── Public Marketplace ─────────────────────────────────────
    @GetMapping("/marketplace")
    public ResponseEntity<?> getMarketplace(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String storageType,
            @RequestParam(required = false) String dosageForm,
            @RequestParam(required = false) Integer maxDaysToExpiry) {

        List<MedicineBatch> batches = batchRepository.findAvailableOnMarketplace();
        LocalDate now = LocalDate.now();

        // Enrich with organization names
        Map<Long, String> orgNames = new HashMap<>();
        orgRepository.findAll().forEach(org -> orgNames.put(org.getId(), org.getName()));

        List<Map<String, Object>> response = batches.stream()
                .filter(b -> search == null || search.isBlank() ||
                        b.getMedicineName().toLowerCase().contains(search.toLowerCase()) ||
                        b.getLotNumber().toLowerCase().contains(search.toLowerCase()) ||
                        b.getManufacturerName().toLowerCase().contains(search.toLowerCase()))
                .filter(b -> storageType == null || storageType.isBlank() ||
                        b.getStorageType().name().equalsIgnoreCase(storageType))
                .filter(b -> dosageForm == null || dosageForm.isBlank() ||
                        b.getDosageForm().name().equalsIgnoreCase(dosageForm))
                .filter(b -> maxDaysToExpiry == null ||
                        java.time.temporal.ChronoUnit.DAYS.between(now, b.getExpiryDate()) <= maxDaysToExpiry)
                .map(b -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", b.getId());
                    map.put("organizationId", b.getOrganizationId());
                    map.put("organizationName", orgNames.getOrDefault(b.getOrganizationId(), "Authorized Facility"));
                    map.put("medicineName", b.getMedicineName());
                    map.put("ndcCode", b.getNdcCode());
                    map.put("lotNumber", b.getLotNumber());
                    map.put("manufacturerName", b.getManufacturerName());
                    map.put("dosageForm", b.getDosageForm().name());
                    map.put("strength", b.getStrength());
                    map.put("expiryDate", b.getExpiryDate().toString());
                    map.put("quantity", b.getQuantity());
                    map.put("storageType", b.getStorageType().name());
                    map.put("storageLog", b.getStorageLog());
                    map.put("packagingIntegrity", b.getPackagingIntegrity());
                    map.put("notRecalled", b.getNotRecalled());
                    map.put("specialNotes", b.getSpecialNotes());
                    map.put("status", b.getStatus().name());
                    map.put("createdAt", b.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // ── User Batches (My Listings) ─────────────────────────────
    @GetMapping("/batches/my")
    public ResponseEntity<?> getMyBatches(@AuthenticationPrincipal User user) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User or organization not found"));
        }
        List<MedicineBatch> batches = batchRepository.findByOrganizationId(user.getOrganizationId());
        return ResponseEntity.ok(batches);
    }

    // ── Create Batch ───────────────────────────────────────────
    @PostMapping("/batches")
    public ResponseEntity<?> createBatch(@AuthenticationPrincipal User user, @Valid @RequestBody BatchRequest req) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Organization required to list medicine"));
        }

        LocalDate exp = LocalDate.parse(req.getExpiryDate());
        if (exp.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Expiry date must be in the future"));
        }

        MedicineBatch batch = MedicineBatch.builder()
                .organizationId(user.getOrganizationId())
                .medicineName(req.getMedicineName())
                .ndcCode(req.getNdcCode())
                .lotNumber(req.getLotNumber())
                .manufacturerName(req.getManufacturerName())
                .dosageForm(MedicineBatch.DosageForm.valueOf(req.getDosageForm()))
                .strength(req.getStrength())
                .expiryDate(exp)
                .quantity(req.getQuantity())
                .storageType(Organization.StorageType.valueOf(req.getStorageType()))
                .storageLog(req.getStorageLog())
                .packagingIntegrity(Boolean.TRUE.equals(req.getPackagingIntegrity()))
                .notRecalled(Boolean.TRUE.equals(req.getNotRecalled()))
                .specialNotes(req.getSpecialNotes())
                .status(MedicineBatch.BatchStatus.PENDING_REVIEW)
                .build();

        MedicineBatch saved = batchRepository.save(batch);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .action("BATCH_CREATED")
                .entityType("MedicineBatch")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Created batch for " + saved.getMedicineName() + " (Qty: " + saved.getQuantity() + ")")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Update Batch ───────────────────────────────────────────
    @PutMapping("/batches/{id}")
    public ResponseEntity<?> updateBatch(@AuthenticationPrincipal User user, @PathVariable Long id, @RequestBody Map<String, Object> updates) {
        MedicineBatch batch = batchRepository.findById(id).orElse(null);
        if (batch == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !batch.getOrganizationId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to update this batch"));
        }

        if (updates.containsKey("medicineName")) batch.setMedicineName((String) updates.get("medicineName"));
        if (updates.containsKey("strength")) batch.setStrength((String) updates.get("strength"));
        if (updates.containsKey("quantity")) batch.setQuantity(((Number) updates.get("quantity")).intValue());
        if (updates.containsKey("storageType")) batch.setStorageType(Organization.StorageType.valueOf((String) updates.get("storageType")));
        if (updates.containsKey("expiryDate")) batch.setExpiryDate(LocalDate.parse((String) updates.get("expiryDate")));
        if (updates.containsKey("specialNotes")) batch.setSpecialNotes((String) updates.get("specialNotes"));

        MedicineBatch saved = batchRepository.save(batch);
        return ResponseEntity.ok(saved);
    }

    // ── Withdraw Batch ─────────────────────────────────────────
    @PostMapping("/batches/{id}/withdraw")
    public ResponseEntity<?> withdrawBatch(@AuthenticationPrincipal User user, @PathVariable Long id) {
        MedicineBatch batch = batchRepository.findById(id).orElse(null);
        if (batch == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !batch.getOrganizationId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized"));
        }

        batch.setStatus(MedicineBatch.BatchStatus.WITHDRAWN);
        MedicineBatch saved = batchRepository.save(batch);

        auditLogRepository.save(AuditLog.builder()
                .action("BATCH_WITHDRAWN")
                .entityType("MedicineBatch")
                .entityId(saved.getId())
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Batch withdrawn from redistribution")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    // ── Delete Batch ───────────────────────────────────────────
    @DeleteMapping("/batches/{id}")
    public ResponseEntity<?> deleteBatch(@AuthenticationPrincipal User user, @PathVariable Long id) {
        MedicineBatch batch = batchRepository.findById(id).orElse(null);
        if (batch == null) return ResponseEntity.notFound().build();

        if (user.getRole() != User.Role.ADMIN && !batch.getOrganizationId().equals(user.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized"));
        }

        batchRepository.delete(batch);

        auditLogRepository.save(AuditLog.builder()
                .action("BATCH_DELETED")
                .entityType("MedicineBatch")
                .entityId(id)
                .userId(user.getId())
                .userName(user.getFullName())
                .userRole(user.getRole().name())
                .details("Batch deleted")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(Map.of("message", "Batch successfully deleted"));
    }

    // ── Admin: Pending Review Batches ──────────────────────────
    @GetMapping("/admin/batches/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingBatches() {
        return ResponseEntity.ok(batchRepository.findByStatus(MedicineBatch.BatchStatus.PENDING_REVIEW));
    }

    // ── Admin: Review Batch ────────────────────────────────────
    @PostMapping("/admin/batches/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewBatch(@AuthenticationPrincipal User admin, @PathVariable Long id, @RequestBody Map<String, String> body) {
        MedicineBatch batch = batchRepository.findById(id).orElse(null);
        if (batch == null) return ResponseEntity.notFound().build();

        String statusStr = body.get("status");
        String reviewNote = body.get("reviewNote");

        MedicineBatch.BatchStatus newStatus = MedicineBatch.BatchStatus.valueOf(statusStr);
        batch.setStatus(newStatus);
        batch.setReviewNote(reviewNote);
        batch.setReviewedBy(admin != null ? admin.getId() : null);
        batch.setReviewedAt(LocalDateTime.now());

        MedicineBatch saved = batchRepository.save(batch);

        auditLogRepository.save(AuditLog.builder()
                .action("BATCH_REVIEWED")
                .entityType("MedicineBatch")
                .entityId(saved.getId())
                .userId(admin != null ? admin.getId() : null)
                .userName(admin != null ? admin.getFullName() : "Admin")
                .userRole("ADMIN")
                .details("Batch reviewed: " + newStatus + (reviewNote != null ? " - " + reviewNote : ""))
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    // ── DTO ────────────────────────────────────────────────────
    @Data
    public static class BatchRequest {
        @NotBlank private String medicineName;
        @NotBlank private String ndcCode;
        @NotBlank private String lotNumber;
        @NotBlank private String manufacturerName;
        @NotBlank private String dosageForm;
        private String strength;
        @NotBlank private String expiryDate;
        @NotNull @Min(1) private Integer quantity;
        @NotBlank private String storageType;
        private String storageLog;
        private Boolean packagingIntegrity;
        private Boolean notRecalled;
        private String specialNotes;
    }
}

