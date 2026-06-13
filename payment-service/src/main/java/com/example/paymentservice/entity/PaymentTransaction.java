package com.example.paymentservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String payerPhone;
    
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;
    
    private String referenceId; // Order or Booking ID
    
    private String momoReference; // MTN MoMo internal reference
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private BigDecimal commission;
    private BigDecimal netAmount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Commission logic embedded in entity for strong encapsulation
    public void calculateAndSetCommission() {
        BigDecimal commissionRate = switch (this.transactionType) {
            case PRODUCE -> new BigDecimal("0.10");
            case TRANSPORT, STORAGE -> new BigDecimal("0.05");
        };
        this.commission = this.amount.multiply(commissionRate);
        this.netAmount = this.amount.subtract(this.commission);
    }
}