package com.example.paymentservice.repository;

import com.example.paymentservice.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {
    // In a real app, you'd pass a userId to filter "my" history
    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
}