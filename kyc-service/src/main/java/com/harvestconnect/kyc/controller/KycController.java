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
    public ResponseEntity<KycVerificationResponse> getStatus(@PathVariable UUID userId) {
        return ResponseEntity.ok(kycService.getLatestStatus(userId));
    }
}
