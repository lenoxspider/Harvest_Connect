package com.harvestconnect.transportservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "truck_listing_id", nullable = false)
    private TruckListing truckListing;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "quantity_tons", nullable = false)
    private Double quantityTons;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "commission", nullable = false)
    private BigDecimal commission;

    @Column(name = "status", nullable = false)
    private String status = "PENDING";




}
