package com.harvestconnect.kyc.dto;

import java.util.UUID;

// Sent by the Expo app to your backend to kick off a verification.
// Actual document images should be uploaded separately (e.g. multipart or
// pre-signed S3 URL) and referenced here by URL/key rather than embedded
// as base64, to keep this endpoint lightweight.
public class KycVerificationRequest {

    private UUID userId;
    private String documentType;      // NATIONAL_ID, PASSPORT, DRIVERS_LICENSE
    private String frontImageUrl;
    private String backImageUrl;      // optional, e.g. driver's license back
    private String selfieImageUrl;    // for facial match

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFrontImageUrl() { return frontImageUrl; }
    public void setFrontImageUrl(String frontImageUrl) { this.frontImageUrl = frontImageUrl; }

    public String getBackImageUrl() { return backImageUrl; }
    public void setBackImageUrl(String backImageUrl) { this.backImageUrl = backImageUrl; }

    public String getSelfieImageUrl() { return selfieImageUrl; }
    public void setSelfieImageUrl(String selfieImageUrl) { this.selfieImageUrl = selfieImageUrl; }
}
