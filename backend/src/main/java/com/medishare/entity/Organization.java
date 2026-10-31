package com.medishare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Organization {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrgType type;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @Column(name = "licence_reference")
    private String licenceReference;

    @Column(nullable = false) private String address;
    @Column(nullable = false) private String city;
    @Column(nullable = false) private String state;
    @Column(nullable = false) private String zip;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false)
    private StorageType storageType;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(name = "contact_licence")
    private String contactLicence;

    @Column(nullable = false) private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrgStatus status;

    @Column(name = "review_note") private String reviewNote;
    @Column(name = "document_url") private String documentUrl;
    @Column(name = "verified_at") private LocalDateTime verifiedAt;

    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum OrgType { HOSPITAL, PHARMACY, CLINIC, NGO, DISTRIBUTOR, OTHER }
    public enum OrgStatus { PENDING, VERIFIED, REJECTED, SUSPENDED }
    public enum StorageType { AMBIENT, REFRIGERATED, FROZEN, DEEP_FROZEN }
}
