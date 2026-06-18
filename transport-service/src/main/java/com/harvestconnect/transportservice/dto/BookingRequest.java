package com.harvestconnect.transportservice.dto;

import java.time.Instant;

public record BookingRequest(
        Long listingId,
        String buyerId,
        String pickupLocation,
        String dropoffLocation,
        Instant pickupTime
) {}

