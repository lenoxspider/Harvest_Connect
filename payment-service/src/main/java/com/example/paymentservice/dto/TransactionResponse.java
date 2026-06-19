package com.example.paymentservice.dto;

public record TransactionResponse(
    String id,
    String status,
    String message
) {}
