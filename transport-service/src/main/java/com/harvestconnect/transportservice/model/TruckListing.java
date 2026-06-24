package com.harvestconnect.transportservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "truck_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TruckListing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID transporterId;

    @Column(nullable = false)
    private String truckType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal capacityKg;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerKm;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Instant availableFrom;

    @Builder.Default
    private Instant createdAt = Instant.now();
}

