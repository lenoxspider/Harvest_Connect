package com.harvestconnect.transportservice.repository;

import com.harvestconnect.transportservice.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {}

