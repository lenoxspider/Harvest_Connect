package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.TruckListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TruckListingRepository extends JpaRepository<TruckListing, Long> {

    @Query("SELECT t FROM TruckListing t WHERE " +
            "(:currentLocation IS NULL OR t.currentLocation = :currentLocation) AND " +
            "(:destination IS NULL OR t.destination = :destination) AND " +
            "(:departureDate IS NULL OR t.departureDate = :departureDate) AND " +
            "(:requiredCapacity IS NULL OR t.capacityTons >= :requiredCapacity)")
    List<TruckListing> findListingsWithFilters(
            @Param("currentLocation") String currentLocation,
            @Param("destination") String destination,
            @Param("departureDate") LocalDate departureDate,
            @Param("requiredCapacity") Double requiredCapacity);
}

