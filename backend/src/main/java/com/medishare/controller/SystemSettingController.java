package com.medishare.controller;

import com.medishare.entity.AuditLog;
import com.medishare.entity.SystemSetting;
import com.medishare.entity.User;
import com.medishare.repository.AuditLogRepository;
import com.medishare.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingRepository settingRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSettings() {
        List<SystemSetting> list = settingRepository.findAll();
        Map<String, String> map = new LinkedHashMap<>();
        for (SystemSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        // Provide defaults if table is empty
        if (!map.containsKey("min_expiry_days")) map.put("min_expiry_days", "60");
        if (!map.containsKey("max_cold_chain_excursion")) map.put("max_cold_chain_excursion", "0.5");
        if (!map.containsKey("auto_withdrawal_days")) map.put("auto_withdrawal_days", "14");
        if (!map.containsKey("audit_retention_years")) map.put("audit_retention_years", "6");

        return ResponseEntity.ok(map);
    }

    @PutMapping("/admin/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSettings(@AuthenticationPrincipal User admin, @RequestBody Map<String, String> updates) {
        for (Map.Entry<String, String> entry : updates.entrySet()) {
            SystemSetting s = settingRepository.findById(entry.getKey()).orElse(
                    SystemSetting.builder().settingKey(entry.getKey()).build()
            );
            s.setSettingValue(entry.getValue());
            s.setUpdatedAt(LocalDateTime.now());
            settingRepository.save(s);
        }

        auditLogRepository.save(AuditLog.builder()
                .action("SETTINGS_UPDATED")
                .entityType("SystemSetting")
                .entityId(1L)
                .userId(admin != null ? admin.getId() : null)
                .userName(admin != null ? admin.getFullName() : "Admin")
                .userRole("ADMIN")
                .details("System settings updated: " + updates.keySet())
                .timestamp(LocalDateTime.now())
                .build());

        return getSettings();
    }
}

