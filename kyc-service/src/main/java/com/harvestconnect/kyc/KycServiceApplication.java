package com.harvestconnect.kyc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.harvestconnect.kyc.config.KycChainProperties;

@SpringBootApplication
@EnableConfigurationProperties(KycChainProperties.class)
public class KycServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(KycServiceApplication.class, args);
    }
}
