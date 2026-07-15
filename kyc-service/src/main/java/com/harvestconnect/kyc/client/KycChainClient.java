package com.harvestconnect.kyc.client;

import com.harvestconnect.kyc.config.KycChainProperties;
import com.harvestconnect.kyc.dto.KycVerificationRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

// Wraps calls to KYC-Chain's REST API. The exact endpoint paths and request/
// response fields below are placeholders based on their marketing page
// ("key and token-based authentication", "webhook notifications") - swap
// them for the real paths once you get sandbox docs from their dev portal.
@Component
public class KycChainClient {

    private final WebClient webClient;
    private final KycChainProperties properties;

    public KycChainClient(KycChainProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .build();
    }

    // Kicks off a verification check and returns KYC-Chain's reference id.
    public Mono<String> submitVerification(KycVerificationRequest request) {
        Map<String, Object> body = Map.of(
                "documentType", request.getDocumentType(),
                "frontImageUrl", request.getFrontImageUrl(),
                "backImageUrl", request.getBackImageUrl() == null ? "" : request.getBackImageUrl(),
                "selfieImageUrl", request.getSelfieImageUrl(),
                "externalUserId", request.getUserId().toString()
        );

        return webClient.post()
                .uri("/v1/verifications")               // placeholder path
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("reference"));
    }

    // Polling fallback in case a webhook is missed.
    @SuppressWarnings("rawtypes")
    public Mono<Map> getVerificationStatus(String reference) {
        return webClient.get()
                .uri("/v1/verifications/{reference}", reference)  // placeholder path
                .retrieve()
                .bodyToMono(Map.class);
    }
}
