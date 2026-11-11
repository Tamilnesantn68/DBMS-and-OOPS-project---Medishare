package com.medishare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_batches")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicineBatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "ndc_code", nullable = false)
    private String ndcCode;

    @Column(name = "lot_number", nullable = false)
    private String lotNumber;

    @Column(name = "manufacturer_name", nullable = false)
    private String manufacturerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form", nullable = false)
    private DosageForm dosageForm;

    private String strength;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false)
    private Organization.StorageType storageType;

    @Column(name = "storage_log") private String storageLog;
    @Column(name = "packaging_integrity") private Boolean packagingIntegrity;
    @Column(name = "not_recalled") private Boolean notRecalled;
    @Column(name = "special_notes") private String specialNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status;

    @Column(name = "review_note") private String reviewNote;
    @Column(name = "reviewed_by") private Long reviewedBy;
    @Column(name = "reviewed_at") private LocalDateTime reviewedAt;

    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = BatchStatus.PENDING_REVIEW;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum DosageForm { TABLET, CAPSULE, INJECTION, INFUSION, ORAL_LIQUID, CREAM, PATCH, OTHER }
    public enum BatchStatus { PENDING_REVIEW, APPROVED, REJECTED, WITHDRAWN }
}
