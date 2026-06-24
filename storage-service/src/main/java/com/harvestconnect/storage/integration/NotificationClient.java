package com.harvestconnect.storage.integration;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificationClient {

    private final RestClient restClient = RestClient.create();

    @Value("${notification.service.url:http://localhost:8086}")
    private String notificationServiceUrl;

    public void send(UUID userId, String title, String message, String type) {
        restClient.post()
                .uri(notificationServiceUrl + "/api/notifications/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new NotificationRequest(userId, title, message, type))
                .retrieve()
                .toBodilessEntity();
    }

    private record NotificationRequest(UUID userId, String title, String message, String type) {}
}

