package com.harvestconnect.kyc.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

// Bind from application.yml / env vars - never hardcode the API key.
// Example application.yml:
//
// kyc-chain:
//   base-url: https://api.kyc-chain.com   # replace with the real base URL from your dev portal
//   api-key: ${KYC_CHAIN_API_KEY}
//   webhook-secret: ${KYC_CHAIN_WEBHOOK_SECRET}
@ConfigurationProperties(prefix = "kyc-chain")
public class KycChainProperties {

    private String baseUrl;
    private String apiKey;
    private String webhookSecret;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }
}
