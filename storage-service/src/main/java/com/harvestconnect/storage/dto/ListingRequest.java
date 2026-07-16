package com.harvestconnect.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ListingRequest(
        @NotBlank(message = "Facility name is required")
        String facilityName,

        @NotBlank(message = "Location is required")
        String location,

        BigDecimal latitude,
        BigDecimal longitude,

        @NotNull(message = "Capacity is required")
        @Positive(message = "Capacity must be positive")
        BigDecimal capacityTons,

        @NotNull(message = "Price per ton per day is required")
        @Positive(message = "Price must be positive")
        BigDecimal pricePerTonPerDay,

        String temperatureRange,
        String imageUrl
) {}
