package com.harvestconnect.produce_service.dto;

import java.util.UUID;

public class CreateOrderRequest {

    public UUID getListingId() {
        return listingId;
    }
    public void setListingId(UUID listingId) {
        this.listingId = listingId;
    }
    public Double getQuantityKg() {
        return quantityKg;
    }
    public void setQuantityKg(Double quantityKg) {
        this.quantityKg = quantityKg;
    }
    private UUID listingId;
    private Double quantityKg;

    // Generate getters and setters
}
