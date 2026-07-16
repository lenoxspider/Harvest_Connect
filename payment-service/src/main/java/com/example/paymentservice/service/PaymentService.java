package com.example.paymentservice.service;

import com.example.paymentservice.client.MomoApiClient;
import com.example.paymentservice.dto.*;
import com.example.paymentservice.entity.*;
import com.example.paymentservice.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository repository;
    private final MomoApiClient momoClient;

    @Transactional
    public TransactionResponse initiatePayment(PaymentInitiateRequest request) {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .payerPhone(request.payerPhone())
                .amount(request.amount())
                .transactionType(request.transactionType())
                .referenceId(request.referenceId())
                .status(TransactionStatus.PENDING)
                .build();

        transaction.calculateAndSetCommission();

        transaction = repository.save(transaction);

        String authorizationUrl = "";
        try {
            // Using Paystack's public test secret key for demonstration/evaluation
            String paystackSecret = "sk_test_63539bcad9363fe3452425f190e29b4e138a0c24";
            int amountPesewas = request.amount().multiply(new java.math.BigDecimal("100")).intValue();
            String jsonPayload = String.format(
                "{\"email\":\"buyer@harvestconnect.com\",\"amount\":\"%d\",\"currency\":\"GHS\"}",
                amountPesewas
            );

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest paystackRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.paystack.co/transaction/initialize"))
                    .header("Authorization", "Bearer " + paystackSecret)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(paystackRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                String body = response.body();
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"authorization_url\":\"([^\"]+)\"");
                java.util.regex.Matcher matcher = pattern.matcher(body);
                if (matcher.find()) {
                    authorizationUrl = matcher.group(1);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        transaction.setMomoReference(authorizationUrl);
        repository.save(transaction);

        return new TransactionResponse(transaction.getId(), "PENDING", "Payment initiated. Complete via Paystack URL.", authorizationUrl);
    }

    @Transactional
    public void processCallback(MomoCallbackRequest callback) {
        PaymentTransaction transaction = repository.findById(callback.externalId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if ("SUCCESSFUL".equalsIgnoreCase(callback.status())) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.calculateAndSetCommission(); // Holds funds in escrow state implicitly via DB
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
        }
        
        repository.save(transaction);
    }

    @Transactional
    public TransactionResponse releaseEscrow(String transactionId) {
        PaymentTransaction transaction = repository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.SUCCESS) {
            throw new IllegalStateException("Cannot release funds. Transaction is not in SUCCESS state.");
        }

        // Call MoMo Disbursement API to send netAmount to the seller
        boolean isDisbursed = momoClient.disburseFunds(
                "SELLER_PHONE_PLACEHOLDER", // Look up seller phone based on referenceId
                transaction.getNetAmount().toString(),
                "Escrow release for order: " + transaction.getReferenceId()
        );

        if (isDisbursed) {
            transaction.setStatus(TransactionStatus.ESCROW_RELEASED);
            repository.save(transaction);
            return new TransactionResponse(transaction.getId(), "ESCROW_RELEASED", "Funds transferred to seller.", null);
        }
        
        throw new RuntimeException("MoMo disbursement failed");
    }

    public List<PaymentTransaction> getHistory() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
