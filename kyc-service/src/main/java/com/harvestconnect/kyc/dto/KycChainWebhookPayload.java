package com.harvestconnect.kyc.dto;

// NOTE: Field names here are placeholders. KYC-Chain's actual webhook
// payload schema is only available once you have sandbox/developer portal
// access - update this class to match their real docs before going live.
public class KycChainWebhookPayload {

    private String reference;     // maps to KycVerification.kycChainReference
    private String status;        // e.g. "approved", "rejected", "pending"
    private String reason;        // rejection reason, if any
    private String signature;     // for verifying the webhook came from KYC-Chain

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
}
