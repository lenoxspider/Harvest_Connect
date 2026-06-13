package com.example.paymentservice.controller;

import com.example.paymentservice.dto.*;
import com.example.paymentservice.entity.PaymentTransaction;
import com.example.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*") // Global CORS for this controller
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<TransactionResponse> initiatePayment(@Valid @RequestBody PaymentInitiateRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @PostMapping("/callback")
    public ResponseEntity<Void> momoCallback(@RequestBody MomoCallbackRequest request) {
        paymentService.processCallback(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/release/{transaction_id}")
    public ResponseEntity<TransactionResponse> releaseEscrow(@PathVariable("transaction_id") String transactionId) {
        return ResponseEntity.ok(paymentService.releaseEscrow(transactionId));
    }

    @GetMapping("/history/my")
    public ResponseEntity<List<PaymentTransaction>> getHistory() {
        return ResponseEntity.ok(paymentService.getHistory());
    }
}