package com.harvestconnect.storage.service;

import com.harvestconnect.storage.domain.BookingStatus;
import com.harvestconnect.storage.domain.StorageBooking;
import com.harvestconnect.storage.domain.StorageListing;
import com.harvestconnect.storage.dto.BookingRequest;
import com.harvestconnect.storage.dto.ListingRequest;
import com.harvestconnect.storage.integration.NotificationClient;
import com.harvestconnect.storage.repository.StorageBookingRepository;
import com.harvestconnect.storage.repository.StorageListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final StorageListingRepository listingRepo;
    private final StorageBookingRepository bookingRepo;
    private final NotificationClient notificationClient;

    private static final BigDecimal PLATFORM_COMMISSION_RATE = new BigDecimal("0.05");

    // ─── Listings ─────────────────────────────────────────────────────────────

    @Transactional
    public StorageListing createListing(ListingRequest req, UUID ownerId) {
        StorageListing listing = new StorageListing();
        listing.setOwnerId(ownerId);
        listing.setFacilityName(req.facilityName());
        listing.setLocation(req.location());
        listing.setLatitude(req.latitude());
        listing.setLongitude(req.longitude());
        listing.setCapacityTons(req.capacityTons());
        listing.setAvailableTons(req.capacityTons());
        listing.setPricePerTonPerDay(req.pricePerTonPerDay());
        listing.setTemperatureRange(req.temperatureRange());
        listing.setIsAvailable(true);
        return listingRepo.save(listing);
    }

    public List<StorageListing> getListings(String location, BigDecimal availableTons,
                                             BigDecimal minPrice, BigDecimal maxPrice) {
        return listingRepo.findWithFilters(location, availableTons, minPrice, maxPrice);
    }

    public StorageListing getListingById(UUID id) {
        return listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Storage listing not found: " + id));
    }

    public List<StorageListing> getMyListings(UUID ownerId) {
        return listingRepo.findByOwnerId(ownerId);
    }

    // ─── Bookings ─────────────────────────────────────────────────────────────

    @Transactional
    public StorageBooking bookStorage(BookingRequest req, UUID farmerId) {
        StorageListing listing = listingRepo.findById(req.storageListingId())
                .orElseThrow(() -> new RuntimeException("Storage listing not found: " + req.storageListingId()));

        if (!listing.getIsAvailable()) {
            throw new IllegalArgumentException("This facility is not available for booking");
        }

        if (req.startDate().isAfter(req.endDate()) || req.startDate().isEqual(req.endDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        if (listing.getAvailableTons().compareTo(req.quantityTons()) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient capacity. Available: " + listing.getAvailableTons() + " tons"
            );
        }

        long days = ChronoUnit.DAYS.between(req.startDate(), req.endDate());

        BigDecimal basePrice = listing.getPricePerTonPerDay()
                .multiply(req.quantityTons())
                .multiply(BigDecimal.valueOf(days))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal commission = basePrice.multiply(PLATFORM_COMMISSION_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPrice = basePrice.add(commission);

        // Reduce available capacity
        listing.setAvailableTons(listing.getAvailableTons().subtract(req.quantityTons()));
        listingRepo.save(listing);

        StorageBooking booking = new StorageBooking();
        booking.setFarmerId(farmerId);
        booking.setListing(listing);
        booking.setQuantityTons(req.quantityTons());
        booking.setStartDate(req.startDate());
        booking.setEndDate(req.endDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        StorageBooking saved = bookingRepo.save(booking);
        safeNotify(
                listing.getOwnerId(),
                "New storage booking request",
                "You have a new booking request for " + req.quantityTons() + " tons at " + listing.getFacilityName() + ".",
                "BOOKING_REQUEST"
        );
        safeNotify(
                farmerId,
                "Storage booking requested",
                "Your booking request was sent to " + listing.getFacilityName() + ".",
                "BOOKING_REQUEST"
        );
        return saved;
    }

    public List<StorageBooking> getMyBookings(UUID farmerId) {
        return bookingRepo.findByFarmerId(farmerId);
    }

    public List<StorageBooking> getIncomingBookings(UUID ownerId) {
        return bookingRepo.findByListingOwnerId(ownerId);
    }

    @Transactional
    public StorageBooking confirmBooking(UUID bookingId, UUID ownerId) {
        StorageBooking booking = getBookingOrThrow(bookingId);

        if (!booking.getListing().getOwnerId().equals(ownerId)) {
            throw new IllegalArgumentException("You are not the owner of this listing");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        StorageBooking saved = bookingRepo.save(booking);
        safeNotify(
                booking.getFarmerId(),
                "Storage booking confirmed",
                "Your booking at " + booking.getListing().getFacilityName() + " was confirmed.",
                "BOOKING_CONFIRMED"
        );
        return saved;
    }

    @Transactional
    public StorageBooking completeBooking(UUID bookingId, UUID userId) {
        StorageBooking booking = getBookingOrThrow(bookingId);

        boolean isOwner = booking.getListing().getOwnerId().equals(userId);
        boolean isFarmer = booking.getFarmerId().equals(userId);

        if (!isOwner && !isFarmer) {
            throw new IllegalArgumentException("Not authorized to complete this booking");
        }
        if (booking.getStatus() != BookingStatus.ACTIVE && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Booking must be ACTIVE or CONFIRMED to complete");
        }

        // Restore available capacity
        StorageListing listing = booking.getListing();
        listing.setAvailableTons(listing.getAvailableTons().add(booking.getQuantityTons()));
        listingRepo.save(listing);

        booking.setStatus(BookingStatus.COMPLETED);
        StorageBooking saved = bookingRepo.save(booking);
        safeNotify(
                booking.getFarmerId(),
                "Storage booking completed",
                "Your booking at " + booking.getListing().getFacilityName() + " is completed.",
                "BOOKING_COMPLETED"
        );
        safeNotify(
                booking.getListing().getOwnerId(),
                "Storage booking completed",
                "A booking at " + booking.getListing().getFacilityName() + " is completed.",
                "BOOKING_COMPLETED"
        );
        return saved;
    }

    @Transactional
    public StorageBooking cancelBooking(UUID bookingId, UUID userId) {
        StorageBooking booking = getBookingOrThrow(bookingId);

        boolean isOwner = booking.getListing().getOwnerId().equals(userId);
        boolean isFarmer = booking.getFarmerId().equals(userId);

        if (!isOwner && !isFarmer) {
            throw new IllegalArgumentException("Not authorized to cancel this booking");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already " + booking.getStatus());
        }

        // Restore capacity if not yet completed
        StorageListing listing = booking.getListing();
        listing.setAvailableTons(listing.getAvailableTons().add(booking.getQuantityTons()));
        listingRepo.save(listing);

        booking.setStatus(BookingStatus.CANCELLED);
        StorageBooking saved = bookingRepo.save(booking);
        safeNotify(
                booking.getFarmerId(),
                "Storage booking cancelled",
                "A storage booking at " + booking.getListing().getFacilityName() + " was cancelled.",
                "BOOKING_CANCELLED"
        );
        safeNotify(
                booking.getListing().getOwnerId(),
                "Storage booking cancelled",
                "A booking at " + booking.getListing().getFacilityName() + " was cancelled.",
                "BOOKING_CANCELLED"
        );
        return saved;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private StorageBooking getBookingOrThrow(UUID id) {
        return bookingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    private void safeNotify(UUID userId, String title, String message, String type) {
        try {
            notificationClient.send(userId, title, message, type);
        } catch (Exception e) {
            // Notification failures must not break core flows.
            // Rely on service logs for debugging in dev.
            System.out.println("[notifications] failed to send: " + e.getMessage());
        }
    }
}
