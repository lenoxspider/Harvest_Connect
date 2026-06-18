package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.TruckListing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TruckListingRepository extends JpaRepository<TruckListing, Long> {}

