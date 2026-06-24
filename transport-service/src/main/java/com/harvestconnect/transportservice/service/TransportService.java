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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransportService {
    private final TruckListingRepository listingRepository;
    private final BookingRepository bookingRepository;

    public List<TruckListing> listTrucks() {
        return listingRepository.findAll();
    }

    public List<TruckListing> getMyTrucks(UUID transporterId) {
        return listingRepository.findByTransporterId(transporterId);
    }

    public TruckListing createListing(ListingRequest request, UUID transporterId) {
        TruckListing listing = TruckListing.builder()
                .transporterId(transporterId)
                .truckType(request.truckType())
                .capacityKg(request.capacityKg())
                .pricePerKm(request.pricePerKm())
                .availableFrom(request.availableFrom())
                .location(request.location())
                .status("AVAILABLE")
                .build();
        return listingRepository.save(listing);
    }

    @Transactional
    public Booking createBooking(BookingRequest request, UUID farmerId) {
        TruckListing listing = listingRepository.findById(request.truckId())
                .orElseThrow(() -> new IllegalArgumentException("Truck not found: " + request.truckId()));

        if (!"AVAILABLE".equalsIgnoreCase(listing.getStatus())) {
            throw new IllegalArgumentException("Truck is not available");
        }

        BigDecimal cost = listing.getPricePerKm() != null ? listing.getPricePerKm() : BigDecimal.ZERO;
        Booking booking = Booking.builder()
                .listing(listing)
                .farmerId(farmerId)
                .pickupLocation(request.pickupLocation())
                .deliveryLocation(request.deliveryLocation())
                .scheduledDate(request.scheduledDate())
                .totalCost(cost)
                .status("PENDING")
                .build();
        return bookingRepository.save(booking);
    }

    public List<Booking> getIncomingBookings(UUID transporterId) {
        return bookingRepository.findByListingTransporterId(transporterId);
    }

    public List<Booking> getMyBookings(UUID farmerId) {
        return bookingRepository.findByFarmerId(farmerId);
    }

    public Booking getBookingById(Long bookingId, UUID userId, String role) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        boolean ok =
                ("TRANSPORTER".equals(role) && booking.getListing().getTransporterId().equals(userId)) ||
                ("FARMER".equals(role) && booking.getFarmerId().equals(userId));
        if (!ok) {
            throw new IllegalArgumentException("Not authorized to view this booking");
        }
        return booking;
    }

    @Transactional
    public Booking acceptBooking(Long bookingId, UUID transporterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!booking.getListing().getTransporterId().equals(transporterId)) {
            throw new IllegalArgumentException("Not authorized to accept this booking");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Only PENDING bookings can be accepted");
        }

        booking.setStatus("CONFIRMED");
        booking.getListing().setStatus("BOOKED");
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateStatus(Long bookingId, UUID transporterId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!booking.getListing().getTransporterId().equals(transporterId)) {
            throw new IllegalArgumentException("Not authorized to update this booking");
        }

        String s = status == null ? "" : status.trim().toUpperCase();
        if (!List.of("CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED").contains(s)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        booking.setStatus(s);
        if ("COMPLETED".equals(s) || "CANCELLED".equals(s)) {
            booking.getListing().setStatus("AVAILABLE");
        }
        return bookingRepository.save(booking);
    }
}
