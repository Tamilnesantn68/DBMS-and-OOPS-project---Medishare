package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.entity.Organization;
import com.medishare.entity.User;
import com.medishare.repository.AuditLogRepository;
import com.medishare.repository.OrganizationRepository;
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
public class OrganizationController {

    private final OrganizationRepository organizationRepository;
    private final AuditLogRepository auditLogRepository;

    // ── My Organization ───────────────────────────────────────
    @GetMapping("/organizations/me")
    public ResponseEntity<?> getMyOrg(@AuthenticationPrincipal User user) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Organization not linked"));
        }
        Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
        if (org == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(org);
    }

    // ── Update My Organization ────────────────────────────────
    @PutMapping("/organizations/me")
    public ResponseEntity<?> updateMyOrg(@AuthenticationPrincipal User user, @RequestBody Map<String, Object> updates) {
        if (user == null || user.getOrganizationId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Organization org = organizationRepository.findById(user.getOrganizationId()).orElse(null);
        if (org == null) return ResponseEntity.notFound().build();

        if (updates.containsKey("name")) org.setName((String) updates.get("name"));
        if (updates.containsKey("address")) org.setAddress((String) updates.get("address"));
        if (updates.containsKey("city")) org.setCity((String) updates.get("city"));
        if (updates.containsKey("state")) org.setState((String) updates.get("state"));
        if (updates.containsKey("zip")) org.setZip((String) updates.get("zip"));
        if (updates.containsKey("storageType")) org.setStorageType(Organization.StorageType.valueOf((String) updates.get("storageType")));
        if (updates.containsKey("contactName")) org.setContactName((String) updates.get("contactName"));
        if (updates.containsKey("contactLicence")) org.setContactLicence((String) updates.get("contactLicence"));

        Organization saved = organizationRepository.save(org);
        return ResponseEntity.ok(saved);
    }

    // ── Admin: List All Organizations ─────────────────────────
    @GetMapping("/admin/organizations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrganizations(@RequestParam(required = false) String status) {
        List<Organization> orgs = organizationRepository.findAll();
        if (status != null && !status.isBlank()) {
            Organization.OrgStatus orgStatus = Organization.OrgStatus.valueOf(status);
            orgs = orgs.stream().filter(o -> o.getStatus() == orgStatus).toList();
        }
        return ResponseEntity.ok(orgs);
    }

    // ── Admin: Verify / Review Organization ───────────────────
    @PostMapping("/admin/organizations/{id}/verification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyOrganization(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Organization org = organizationRepository.findById(id).orElse(null);
        if (org == null) return ResponseEntity.notFound().build();

        String statusStr = body.get("status");
        String reviewNote = body.get("reviewNote");

        Organization.OrgStatus newStatus = Organization.OrgStatus.valueOf(statusStr);
        org.setStatus(newStatus);
        org.setReviewNote(reviewNote);
        if (newStatus == Organization.OrgStatus.VERIFIED) {
            org.setVerifiedAt(LocalDateTime.now());
        }

        Organization saved = organizationRepository.save(org);

        auditLogRepository.save(AuditLog.builder()
                .action("ORG_VERIFICATION_UPDATED")
                .entityType("Organization")
                .entityId(saved.getId())
                .userId(admin != null ? admin.getId() : null)
                .userName(admin != null ? admin.getFullName() : "Admin")
                .userRole("ADMIN")
                .details("Organization status changed to " + newStatus + (reviewNote != null ? " - " + reviewNote : ""))
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }
}

