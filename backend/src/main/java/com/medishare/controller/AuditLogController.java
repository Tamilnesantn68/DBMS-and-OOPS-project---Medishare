package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String entityType) {

        List<AuditLog> list = auditLogRepository.findAllByOrderByTimestampDesc();
        if (entityType != null && !entityType.isBlank() && !"ALL".equalsIgnoreCase(entityType)) {
            list = list.stream().filter(a -> a.getEntityType().equalsIgnoreCase(entityType)).toList();
        }
        if (q != null && !q.isBlank()) {
            String lower = q.toLowerCase();
            list = list.stream().filter(a ->
                    (a.getDetails() != null && a.getDetails().toLowerCase().contains(lower)) ||
                    (a.getUserName() != null && a.getUserName().toLowerCase().contains(lower)) ||
                    (a.getAction() != null && a.getAction().toLowerCase().contains(lower))
            ).toList();
        }

        return ResponseEntity.ok(list);
    }
}

