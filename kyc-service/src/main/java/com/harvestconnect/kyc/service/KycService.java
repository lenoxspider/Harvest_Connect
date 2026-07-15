package com.harvestconnect.kyc.service;

import com.harvestconnect.kyc.client.KycChainClient;
import com.harvestconnect.kyc.dto.KycChainWebhookPayload;
import com.harvestconnect.kyc.dto.KycVerificationRequest;
import com.harvestconnect.kyc.dto.KycVerificationResponse;
import com.harvestconnect.kyc.entity.KycStatus;
import com.harvestconnect.kyc.entity.KycVerification;
import com.harvestconnect.kyc.repository.KycVerificationRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class KycService {

    private final KycChainClient kycChainClient;
    private final KycVerificationRepository repository;

    public KycService(KycChainClient kycChainClient, KycVerificationRepository repository) {
        this.kycChainClient = kycChainClient;
        this.repository = repository;
    }

    public KycVerificationResponse startVerification(KycVerificationRequest request) {
        KycVerification verification = new KycVerification();
        verification.setUserId(request.getUserId());
        verification.setDocumentType(request.getDocumentType());
        verification.setStatus(KycStatus.PENDING);

        String reference = kycChainClient.submitVerification(request).block();
        verification.setKycChainReference(reference);

        repository.save(verification);

        return toResponse(verification);
    }

    public KycVerificationResponse getLatestStatus(UUID userId) {
        KycVerification verification = repository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new IllegalArgumentException("No KYC record found for user " + userId));
        return toResponse(verification);
    }

    public void handleWebhook(KycChainWebhookPayload payload) {
        KycVerification verification = repository.findByKycChainReference(payload.getReference())
                .orElseThrow(() -> new IllegalArgumentException("Unknown KYC reference: " + payload.getReference()));

        verification.setStatus(mapStatus(payload.getStatus()));
        verification.setRejectionReason(payload.getReason());
        repository.save(verification);
    }

    private KycStatus mapStatus(String kycChainStatus) {
        if (kycChainStatus == null) return KycStatus.PENDING;
        return switch (kycChainStatus.toLowerCase()) {
            case "approved", "verified" -> KycStatus.VERIFIED;
            case "rejected", "declined" -> KycStatus.REJECTED;
            case "in_review", "review" -> KycStatus.IN_REVIEW;
            case "expired" -> KycStatus.EXPIRED;
            default -> KycStatus.PENDING;
        };
    }

    private KycVerificationResponse toResponse(KycVerification v) {
        return new KycVerificationResponse(v.getUserId(), v.getStatus(), v.getRejectionReason(), v.getUpdatedAt());
    }
}
