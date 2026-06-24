package com.harvestconnect.transportservice.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TruckResponse(
        String id,
        UUID transporterId,
        String truckType,
        BigDecimal capacityKg,
        BigDecimal pricePerKm,
        Instant availableFrom,
        String location,
        String status
) {}

