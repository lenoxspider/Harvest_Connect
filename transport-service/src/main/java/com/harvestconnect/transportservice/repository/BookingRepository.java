package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByListingTransporterId(UUID transporterId);
    List<Booking> findByFarmerId(UUID farmerId);
}

