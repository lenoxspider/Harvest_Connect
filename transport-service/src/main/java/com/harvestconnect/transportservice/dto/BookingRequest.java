package com.harvestconnect.transportservice.dto;

import java.time.Instant;

public record BookingRequest(
        Long truckId,
        String pickupLocation,
        String deliveryLocation,
        Instant scheduledDate
) {}

