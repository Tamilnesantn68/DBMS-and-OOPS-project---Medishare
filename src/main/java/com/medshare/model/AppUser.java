package com.medshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/**
 * A system user. ADMIN manages the platform; CLINIC donates and requests medicine.
 * {@code status} only matters for clinics: PENDING until an admin approves them.
 */
public record AppUser(
        Long id,
        String username,
        @JsonIgnore String passwordHash,
        String role,
        String clinicName,
        String contactPerson,
        String phone,
        String address,
        String city,
        String status,
        LocalDateTime createdAt
) {
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_CLINIC = "CLINIC";

    public AppUser withoutSecrets() {
        return new AppUser(id, username, null, role, clinicName, contactPerson, phone, address, city, status, createdAt);
    }
}
