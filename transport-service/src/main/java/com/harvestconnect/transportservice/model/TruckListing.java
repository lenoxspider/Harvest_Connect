package com.harvestconnect.transportservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

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

    private String truckNumber;
    private String driverName;
    private String driverPhone;
    private String currentLocation;
    private BigDecimal pricePerKm;

    @Builder.Default
    private Instant createdAt = Instant.now();
}

