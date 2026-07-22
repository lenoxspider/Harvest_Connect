package com.example.notification.dto;

import java.util.UUID;

public record NotificationRequest(
    Long userId,
    String title,
    String message,
    String type
) {}