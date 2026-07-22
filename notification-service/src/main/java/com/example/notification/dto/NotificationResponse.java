package com.example.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    Long userId,
    String title,
    String message,
    String type,
    boolean isRead,
    LocalDateTime createdAt
) {}