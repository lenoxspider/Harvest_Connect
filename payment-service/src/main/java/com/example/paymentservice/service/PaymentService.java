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

        transaction = repository.save(transaction);

        // Call MTN MoMo
        String momoRef = momoClient.requestToPay(
                transaction.getPayerPhone(), 
                transaction.getAmount().toString(), 
                transaction.getId()
        );
        
        transaction.setMomoReference(momoRef);
        repository.save(transaction);

        return new TransactionResponse(transaction.getId(), "PENDING", "Payment initiated. Awaiting MoMo confirmation.");
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
            return new TransactionResponse(transaction.getId(), "ESCROW_RELEASED", "Funds transferred to seller.");
        }
        
        throw new RuntimeException("MoMo disbursement failed");
    }

    public List<PaymentTransaction> getHistory() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
}
