package com.medshare.model;

import java.time.LocalDateTime;

/**
 * A medicine need raised by a clinic. PENDING until the admin fulfills it
 * from an approved donation batch (recorded in fulfilledDonationId) or rejects it.
 */
public record MedicineRequest(
        Long id,
        Long clinicId,
        String clinicName,
        String medicineName,
        String category,
        int quantity,
        String urgency,
        String reason,
        String status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt,
        Long fulfilledDonationId
) {
    public static final String PENDING = "PENDING";
    public static final String FULFILLED = "FULFILLED";
    public static final String REJECTED = "REJECTED";
}
