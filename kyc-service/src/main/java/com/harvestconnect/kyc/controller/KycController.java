package com.harvestconnect.kyc.controller;

import com.harvestconnect.kyc.dto.KycVerificationRequest;
import com.harvestconnect.kyc.dto.KycVerificationResponse;
import com.harvestconnect.kyc.service.KycService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/kyc")
public class KycController {

    private final KycService kycService;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    @PostMapping("/verify")
    public ResponseEntity<KycVerificationResponse> startVerification(@RequestBody KycVerificationRequest request) {
        return ResponseEntity.ok(kycService.startVerification(request));
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<KycVerificationResponse> getStatus(@PathVariable String userId) {
        UUID userUuid;
        try {
            userUuid = UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            userUuid = UUID.nameUUIDFromBytes(userId.getBytes());
        }
        return ResponseEntity.ok(kycService.getLatestStatus(userUuid));
    }
}
