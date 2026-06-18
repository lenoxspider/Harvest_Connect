package com.harvestconnect.produce_service.dto;

import java.math.BigDecimal;
import java.util.List;

public class UpdateListingRequest {

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public Double getQuantityKg() {
        return quantityKg;
    }
    public void setQuantityKg(Double quantityKg) {
        this.quantityKg = quantityKg;
    }
    public BigDecimal getPricePerKg() {
        return pricePerKg;
    }
    public void setPricePerKg(BigDecimal pricePerKg) {
        this.pricePerKg = pricePerKg;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public Double getLatitude() {
        return latitude;
    }
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    public Double getLongitude() {
        return longitude;
    }
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    public List<String> getImages() {
        return images;
    }
    public void setImages(List<String> images) {
        this.images = images;
    }
    private String title;
    private String description;
    private String category;
    private Double quantityKg;
    private BigDecimal pricePerKg;
    private String location;
    private Double latitude;
    private Double longitude;
    private List<String> images;

    // Generate getters and setters
}
