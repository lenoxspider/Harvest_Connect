package com.harvestconnect.transportservice.dto;

import java.math.BigDecimal;

public record ListingRequest(
        String truckNumber,
        String driverName,
        String driverPhone,
        String currentLocation,
        BigDecimal pricePerKm
) {}

