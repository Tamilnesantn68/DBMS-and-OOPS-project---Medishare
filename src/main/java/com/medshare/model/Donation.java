package com.medshare.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A batch of medicine a clinic donates. PENDING until the admin approves it;
 * APPROVED batches form the shared stock; DISPENSED batches have been given to a requester.
 */
public record Donation(
        Long id,
        Long clinicId,
        String clinicName,
        String medicineName,
        String batchNo,
        String category,
        int quantity,
        LocalDate expiryDate,
        String notes,
        String status,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
    public static final String PENDING = "PENDING";
    public static final String APPROVED = "APPROVED";
    public static final String REJECTED = "REJECTED";
    public static final String DISPENSED = "DISPENSED";
}
