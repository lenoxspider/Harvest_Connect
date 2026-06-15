package com.harvestconnect.transportservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ListingRequest(
        String truckType,
        Double capacityTons,
        String currentLocation,
        String destination,
        BigDecimal price_per_ton,
        LocalDate departureDate
) {}
