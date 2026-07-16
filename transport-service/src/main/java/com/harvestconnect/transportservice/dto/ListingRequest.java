package com.harvestconnect.transportservice.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ListingRequest(
        String truckType,
        BigDecimal capacityKg,
        BigDecimal pricePerKm,
        Instant availableFrom,
        String location,
        String imageUrl
) {}

