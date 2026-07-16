package com.harvestconnect.storage.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "storage_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StorageListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "facility_name", nullable = false)
    private String facilityName;

    @Column(nullable = false)
    private String location;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(name = "capacity_tons", nullable = false)
    private BigDecimal capacityTons;

    @Column(name = "available_tons", nullable = false)
    private BigDecimal availableTons;

    @Column(name = "price_per_ton_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerTonPerDay;

    @Column(name = "temperature_range")
    private String temperatureRange;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
