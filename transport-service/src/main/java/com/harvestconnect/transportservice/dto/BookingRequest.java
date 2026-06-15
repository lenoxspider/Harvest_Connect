package com.harvestconnect.transportservice.dto;

public record BookingRequest(
        Long truckListingId,
        Double quantityTons
) {}
