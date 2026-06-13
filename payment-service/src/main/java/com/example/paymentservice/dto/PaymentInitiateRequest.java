package com.example.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record PaymentInitiateRequest(
    @NotBlank String payerPhone,
    @NotNull @Positive BigDecimal amount,
    @NotNull TransactionType transactionType,
    @NotBlank String referenceId
) {}