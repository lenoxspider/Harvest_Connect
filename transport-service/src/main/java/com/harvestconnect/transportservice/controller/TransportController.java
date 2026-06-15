package com.harvestconnect.transportservice.controller;

import com.harvestconnect.transportservice.dto.*;
import com.harvestconnect.transportservice.model.*;
import com.harvestconnect.transportservice.service.TransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransportController {

    private final TransportService transportService;

    @PostMapping("/listings")
    public ResponseEntity<?> createListing(
            @RequestBody ListingRequest request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"TRANSPORTER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Only TRANSPORTERS can list truck spaces");
        }
        return ResponseEntity.ok(transportService.createListing(request, userId));
    }

    @GetMapping("/listings")
    public ResponseEntity<List<TruckListing>> getAllListings(
            @RequestParam(required = false) String currentLocation,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) Double availableCapacity) {
        return ResponseEntity.ok(transportService.getAllListings(currentLocation, destination, departureDate, availableCapacity));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<TruckListing> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(transportService.getListingById(id));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<?> updateListing(
            @PathVariable Long id,
            @RequestBody ListingRequest request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"TRANSPORTER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Unauthorized profile type");
        }
        return ResponseEntity.ok(transportService.updateListing(id, request, userId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> bookSpace(
            @RequestBody BookingRequest request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"FARMER".equalsIgnoreCase(role) && !"BUYER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Only Farmers or Buyers can book transport");
        }
        return ResponseEntity.ok(transportService.createBooking(request, userId));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<Booking>> getMyBookings(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(transportService.getUserBookings(userId));
    }

    @GetMapping("/bookings/incoming")
    public ResponseEntity<?> getIncomingBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"TRANSPORTER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(transportService.getIncomingBookings(userId));
    }

    @PutMapping("/bookings/{id}/confirm")
    public ResponseEntity<?> confirmBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"TRANSPORTER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(transportService.confirmBooking(id, userId));
    }

    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId) {
        if (!"TRANSPORTER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(transportService.completeBooking(id, userId));
    }
}
