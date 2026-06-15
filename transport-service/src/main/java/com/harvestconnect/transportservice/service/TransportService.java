package com.harvestconnect.transportservice.service;

import com.harvestconnect.transportservice.dto.*;
import com.harvestconnect.transportservice.model.*;
import com.harvestconnect.transportservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TruckListingRepository listingRepository;
    private final BookingRepository bookingRepository;

    public TruckListing createListing(ListingRequest req, String transporterId) {
        TruckListing listing = new TruckListing();
        listing.setTruckType(req.truckType());
        listing.setCapacityTons(req.capacityTons());
        listing.setCurrentLocation(req.currentLocation());
        listing.setDestination(req.destination());
        listing.setPricePerTon(req.price_per_ton());
        listing.setDepartureDate(req.departureDate());
        listing.setTransporterId(transporterId);
        return listingRepository.save(listing);
    }

    public List<TruckListing> getAllListings(String loc, String dest, LocalDate date, Double capacity) {
        return listingRepository.findListingsWithFilters(loc, dest, date, capacity);
    }

    public TruckListing getListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truck listing not found with ID: " + id));
    }

    public TruckListing updateListing(Long id, ListingRequest req, String transporterId) {
        TruckListing listing = getListingById(id);
        if (!listing.getTransporterId().equals(transporterId)) {
            throw new RuntimeException("Unauthorized to modify this listing");
        }
        listing.setTruckType(req.truckType());
        listing.setCapacityTons(req.capacityTons());
        listing.setCurrentLocation(req.currentLocation());
        listing.setDestination(req.destination());
        listing.setPricePerTon(req.price_per_ton());
        listing.setDepartureDate(req.departureDate());
        return listingRepository.save(listing);
    }

    @Transactional
    public Booking createBooking(BookingRequest req, String userId) {
        TruckListing listing = getListingById(req.truckListingId());

        if (listing.getCapacityTons() < req.quantityTons()) {
            throw new RuntimeException("Not enough available truck capacity left!");
        }

        BigDecimal basicCost = listing.getPricePerTon().multiply(BigDecimal.valueOf(req.quantityTons()));
        BigDecimal platformCommission = basicCost.multiply(new BigDecimal("0.05"));

        Booking booking = new Booking();
        booking.setTruckListing(listing);
        booking.setUserId(userId);
        booking.setQuantityTons(req.quantityTons());
        booking.setTotalPrice(basicCost);
        booking.setCommission(platformCommission);
        booking.setStatus("PENDING");

        listing.setCapacityTons(listing.getCapacityTons() - req.quantityTons());
        listingRepository.save(listing);

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getIncomingBookings(String transporterId) {
        return bookingRepository.findByTruckListingTransporterId(transporterId);
    }

    public Booking confirmBooking(Long bookingId, String transporterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getTruckListing().getTransporterId().equals(transporterId)) {
            throw new RuntimeException("Unauthorized");
        }
        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    public Booking completeBooking(Long bookingId, String transporterId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getTruckListing().getTransporterId().equals(transporterId)) {
            throw new RuntimeException("Unauthorized");
        }
        booking.setStatus("COMPLETED");
        return bookingRepository.save(booking);
    }
}

