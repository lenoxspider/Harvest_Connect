package com.harvestconnect.transportservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "transport_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id")
    private TruckListing listing;

    private String buyerId;
    private String pickupLocation;
    private String dropoffLocation;
    private Instant pickupTime;

    @Builder.Default
    private Instant createdAt = Instant.now();
}

