package com.harvestconnect.kyc.dto;

import com.harvestconnect.kyc.entity.KycStatus;

import java.time.Instant;
import java.util.UUID;

public class KycVerificationResponse {

    private UUID userId;
    private KycStatus status;
    private String rejectionReason;
    private Instant updatedAt;

    public KycVerificationResponse() {}

    public KycVerificationResponse(UUID userId, KycStatus status, String rejectionReason, Instant updatedAt) {
        this.userId = userId;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.updatedAt = updatedAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public KycStatus getStatus() { return status; }
    public void setStatus(KycStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
