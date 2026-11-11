package com.medishare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Transfer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, unique = true)
    private Long requestId;

    @Column(name = "batch_id", nullable = false)
    private Long batchId;

    @Column(name = "donor_org_id", nullable = false)
    private Long donorOrgId;

    @Column(name = "recipient_org_id", nullable = false)
    private Long recipientOrgId;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status;

    @Column(name = "tracking_id", length = 100)
    private String trackingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "temperature_status")
    private TemperatureStatus temperatureStatus;

    @Column(name = "receipt_note", columnDefinition = "TEXT")
    private String receiptNote;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = TransferStatus.APPROVED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TransferStatus { APPROVED, IN_TRANSIT, DELIVERED, RECEIPT_CONFIRMED, CANCELLED }
    public enum TemperatureStatus { COMPLIANT, MINOR_EXCURSION, CRITICAL_EXCURSION }
}

