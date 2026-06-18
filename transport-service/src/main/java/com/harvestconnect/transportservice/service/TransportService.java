package com.harvestconnect.transportservice.service;

import com.harvestconnect.transportservice.dto.BookingRequest;
import com.harvestconnect.transportservice.dto.ListingRequest;
import com.harvestconnect.transportservice.model.Booking;
import com.harvestconnect.transportservice.model.TruckListing;
import com.harvestconnect.transportservice.repository.BookingRepository;
import com.harvestconnect.transportservice.repository.TruckListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {
    private final TruckListingRepository listingRepository;
    private final BookingRepository bookingRepository;

    public List<TruckListing> listTrucks() {
        return listingRepository.findAll();
    }

    public TruckListing createListing(ListingRequest request) {
        TruckListing listing = TruckListing.builder()
                .truckNumber(request.truckNumber())
                .driverName(request.driverName())
                .driverPhone(request.driverPhone())
                .currentLocation(request.currentLocation())
                .pricePerKm(request.pricePerKm())
                .build();
        return listingRepository.save(listing);
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        TruckListing listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + request.listingId()));

        Booking booking = Booking.builder()
                .listing(listing)
                .buyerId(request.buyerId())
                .pickupLocation(request.pickupLocation())
                .dropoffLocation(request.dropoffLocation())
                .pickupTime(request.pickupTime())
                .build();
        return bookingRepository.save(booking);
    }
}

