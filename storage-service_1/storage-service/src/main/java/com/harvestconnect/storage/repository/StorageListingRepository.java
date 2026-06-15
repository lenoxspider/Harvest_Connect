package com.harvestconnect.storage.repository;

import com.harvestconnect.storage.domain.StorageListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface StorageListingRepository extends JpaRepository<StorageListing, UUID> {

    @Query("SELECT l FROM StorageListing l WHERE " +
           "(:location IS NULL OR LOWER(l.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:availableTons IS NULL OR l.availableTons >= :availableTons) AND " +
           "(:minPrice IS NULL OR l.pricePerTonPerDay >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.pricePerTonPerDay <= :maxPrice) AND " +
           "l.isAvailable = true")
    List<StorageListing> findWithFilters(
            @Param("location") String location,
            @Param("availableTons") BigDecimal availableTons,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );

    List<StorageListing> findByOwnerId(UUID ownerId);
}
