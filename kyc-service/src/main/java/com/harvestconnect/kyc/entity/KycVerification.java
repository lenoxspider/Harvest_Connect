package com.harvestconnect.kyc.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kyc_verifications")
public class KycVerification {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // The reference/session id returned by KYC-Chain for this check
    @Column(name = "kyc_chain_reference")
    private String kycChainReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus status = KycStatus.NOT_STARTED;

    @Column(name = "document_type")
    private String documentType; // NATIONAL_ID, PASSPORT, DRIVERS_LICENSE

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public KycVerification() {}

    // Getters and setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getKycChainReference() { return kycChainReference; }
    public void setKycChainReference(String kycChainReference) { this.kycChainReference = kycChainReference; }

    public KycStatus getStatus() { return status; }
    public void setStatus(KycStatus status) { this.status = status; this.updatedAt = Instant.now(); }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
