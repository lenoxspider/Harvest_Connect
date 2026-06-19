package com.harvestconnect.produce_service.security;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class JwtValidationService {

    private final RestTemplate restTemplate;

    public JwtValidationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String validateToken(String token) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token.replace("Bearer ", ""));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(
                        "http://localhost:8081/api/auth/me",
                        HttpMethod.GET,
                        entity,
                        String.class
                );

        return response.getBody();
    }
}
