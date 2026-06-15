package com.harvestconnect.storage.repository;

import com.harvestconnect.storage.domain.StorageBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StorageBookingRepository extends JpaRepository<StorageBooking, UUID> {

    List<StorageBooking> findByFarmerId(UUID farmerId);

    List<StorageBooking> findByListingOwnerId(UUID ownerId);
}
