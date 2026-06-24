package com.harvestconnect.transportservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        String id,
        String truckId,
        UUID farmerId,
        String pickupLocation,
        String deliveryLocation,
        Instant scheduledDate,
        BigDecimal totalCost,
        String status
) {}

