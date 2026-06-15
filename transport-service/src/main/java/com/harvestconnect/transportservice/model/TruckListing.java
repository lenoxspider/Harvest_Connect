package com.harvestconnect.transportservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "truck_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TruckListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Truck type is required")
    @Column(name = "truck_type", nullable = false)
    private String truckType;

    @NotNull(message = "Capacity in tons is required")
    @Min(value = 0, message = "Capacity cannot be negative")
    @Column(name = "capacity_tons", nullable = false)
    private Double capacityTons;

    @NotBlank(message = "Current location is required")
    @Column(name = "current_location", nullable = false)
    private String currentLocation;

    @NotBlank(message = "Destination is required")
    @Column(name = "destination", nullable = false)
    private String destination;

    @NotNull(message = "Price per ton is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "price_per_ton", nullable = false)
    private BigDecimal pricePerTon;

    @NotNull(message = "Departure date is required")
    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "transporter_id", nullable = false)
    private String transporterId; // Captured from auth token/header later
}
