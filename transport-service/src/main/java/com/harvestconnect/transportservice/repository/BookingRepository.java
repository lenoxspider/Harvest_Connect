package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByTruckListingTransporterId(String transporterId);
}
