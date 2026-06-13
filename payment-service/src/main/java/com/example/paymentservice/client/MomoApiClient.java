package com.example.paymentservice.client;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class MomoApiClient {
    
    // Autowire RestClient or WebClient here
    
    public String requestToPay(String phone, String amount, String internalRef) {
        // 1. Generate UUID for X-Reference-Id
        // 2. Fetch Oauth Token using MOMO_API_KEY
        // 3. POST to /collection/v1_0/requesttopay
        // Return the MoMo reference
        return UUID.randomUUID().toString(); // Mock return
    }

    public boolean disburseFunds(String payeePhone, String amount, String description) {
        // 1. POST to /disbursement/v1_0/transfer
        // Return true if successful
        return true; 
    }
}