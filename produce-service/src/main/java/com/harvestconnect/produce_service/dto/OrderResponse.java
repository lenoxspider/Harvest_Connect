package com.harvestconnect.produce_service.dto;

import com.harvestconnect.produce_service.enums.OrderStatus;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderResponse {

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
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
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
    public OrderStatus getStatus() {
        return status;
    }
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    private UUID id;
    private UUID listingId;
    private Double quantityKg;
    private BigDecimal totalPrice;
    private OrderStatus status;

    // Generate getters and setters
}
