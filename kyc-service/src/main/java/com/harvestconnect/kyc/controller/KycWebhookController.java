package com.harvestconnect.kyc.controller;

import com.harvestconnect.kyc.config.KycChainProperties;
import com.harvestconnect.kyc.dto.KycChainWebhookPayload;
import com.harvestconnect.kyc.service.KycService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class KycWebhookController {

    private final KycService kycService;
    private final KycChainProperties properties;

    public KycWebhookController(KycService kycService, KycChainProperties properties) {
        this.kycService = kycService;
        this.properties = properties;
    }

    @PostMapping("/api/kyc/webhook")
    public ResponseEntity<Void> receiveWebhook(
            @RequestBody KycChainWebhookPayload payload,
            @RequestHeader(value = "X-KYC-Signature", required = false) String signature) {

        // TODO: verify `signature` against properties.getWebhookSecret() using
        // whatever HMAC scheme KYC-Chain documents, before trusting the payload.
        if (signature == null) {
            return ResponseEntity.status(401).build();
        }

        kycService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
