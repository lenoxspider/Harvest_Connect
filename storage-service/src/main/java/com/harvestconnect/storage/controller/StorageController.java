package com.harvestconnect.storage.controller;

import com.harvestconnect.storage.dto.BookingRequest;
import com.harvestconnect.storage.dto.ListingRequest;
import com.harvestconnect.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    // ─── 1. Create listing (STORAGE_OWNER only) ──────────────────────────────
    @PostMapping("/listings")
    public ResponseEntity<?> createListing(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID ownerId,
            @RequestBody @Valid ListingRequest request) {

        if (!"STORAGE_OWNER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only STORAGE_OWNERs can create listings"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storageService.createListing(request, ownerId));
    }

    // ─── 2. Get all listings with optional filters ────────────────────────────
    @GetMapping("/listings")
    public ResponseEntity<?> getListings(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal availableTons,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        return ResponseEntity.ok(storageService.getListings(location, availableTons, minPrice, maxPrice));
    }

    // ─── 3. Get single listing ────────────────────────────────────────────────
    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListing(@PathVariable UUID id) {
        return ResponseEntity.ok(storageService.getListingById(id));
    }

    // ─── 4. Book storage (FARMER only) ───────────────────────────────────────
    @PostMapping("/bookings")
    public ResponseEntity<?> bookStorage(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID farmerId,
            @RequestBody @Valid BookingRequest request) {

        if (!"FARMER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only FARMERs can book storage"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storageService.bookStorage(request, farmerId));
    }

    // ─── 5. Get my bookings (FARMER) ─────────────────────────────────────────
    @GetMapping("/bookings/my")
    public ResponseEntity<?> getMyBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID farmerId) {

        if (!"FARMER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only FARMERs can access this endpoint"));
        }
        return ResponseEntity.ok(storageService.getMyBookings(farmerId));
    }

    // ─── 6. Get incoming bookings (STORAGE_OWNER) ────────────────────────────
    @GetMapping("/bookings/incoming")
    public ResponseEntity<?> getIncomingBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID ownerId) {

        if (!"STORAGE_OWNER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only STORAGE_OWNERs can access this endpoint"));
        }
        return ResponseEntity.ok(storageService.getIncomingBookings(ownerId));
    }

    // ─── 7. Confirm booking (STORAGE_OWNER) ──────────────────────────────────
    @PutMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirmBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID ownerId,
            @PathVariable UUID id) {

        if (!"STORAGE_OWNER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only STORAGE_OWNERs can confirm bookings"));
        }
        return ResponseEntity.ok(storageService.confirmBooking(id, ownerId));
    }

    // ─── 8. Complete booking ──────────────────────────────────────────────────
    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {

        return ResponseEntity.ok(storageService.completeBooking(id, userId));
    }

    // ─── 9. Cancel booking ────────────────────────────────────────────────────
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {

        return ResponseEntity.ok(storageService.cancelBooking(id, userId));
    }
}
