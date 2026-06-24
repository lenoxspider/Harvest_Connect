package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.TruckListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

import java.util.List;

public interface TruckListingRepository extends JpaRepository<TruckListing, Long> {
    List<TruckListing> findByTransporterId(UUID transporterId);
}


