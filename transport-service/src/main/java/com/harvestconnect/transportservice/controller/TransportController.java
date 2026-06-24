package com.harvestconnect.transportservice.controller;

import com.harvestconnect.transportservice.dto.BookingRequest;
import com.harvestconnect.transportservice.dto.BookingResponse;
import com.harvestconnect.transportservice.dto.ListingRequest;
import com.harvestconnect.transportservice.dto.TruckResponse;
import com.harvestconnect.transportservice.model.Booking;
import com.harvestconnect.transportservice.model.TruckListing;
import com.harvestconnect.transportservice.service.TransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transport")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class TransportController {
    private final TransportService transportService;

    @GetMapping("/trucks")
    public List<TruckResponse> getListings() {
        return transportService.listTrucks().stream().map(TransportController::toTruckResponse).toList();
    }

    @PostMapping("/trucks")
    public ResponseEntity<?> createListing(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID transporterId,
            @RequestBody ListingRequest request
    ) {
        if (!"TRANSPORTER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only TRANSPORTERs can create truck listings"));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toTruckResponse(transportService.createListing(request, transporterId)));
    }

    @GetMapping("/trucks/my")
    public ResponseEntity<?> getMyTrucks(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID transporterId
    ) {
        if (!"TRANSPORTER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only TRANSPORTERs can access this endpoint"));
        }
        return ResponseEntity.ok(transportService.getMyTrucks(transporterId).stream().map(TransportController::toTruckResponse).toList());
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID farmerId,
            @RequestBody BookingRequest request
    ) {
        if (!"FARMER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only FARMERs can request transport"));
        }
        Booking booking = transportService.createBooking(request, farmerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toBookingResponse(booking));
    }

    @GetMapping("/bookings/incoming")
    public ResponseEntity<?> getIncomingBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID transporterId
    ) {
        if (!"TRANSPORTER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only TRANSPORTERs can access this endpoint"));
        }
        List<Booking> bookings = transportService.getIncomingBookings(transporterId);
        return ResponseEntity.ok(bookings.stream().map(TransportController::toBookingResponse).toList());
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<?> getMyBookings(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID farmerId
    ) {
        if (!"FARMER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only FARMERs can access this endpoint"));
        }
        List<Booking> bookings = transportService.getMyBookings(farmerId);
        return ResponseEntity.ok(bookings.stream().map(TransportController::toBookingResponse).toList());
    }

    @PutMapping("/bookings/{id}/accept")
    public ResponseEntity<?> acceptBooking(
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") UUID transporterId,
            @PathVariable("id") Long id
    ) {
        if (!"TRANSPORTER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only TRANSPORTERs can accept bookings"));
        }
        return ResponseEntity.ok(toBookingResponse(transportService.acceptBooking(id, transporterId)));
    }

    private static TruckResponse toTruckResponse(TruckListing listing) {
        return new TruckResponse(
                String.valueOf(listing.getId()),
                listing.getTransporterId(),
                listing.getTruckType(),
                listing.getCapacityKg(),
                listing.getPricePerKm(),
                listing.getAvailableFrom(),
                listing.getLocation(),
                listing.getStatus()
        );
    }

    private static BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
                String.valueOf(booking.getId()),
                String.valueOf(booking.getListing().getId()),
                booking.getFarmerId(),
                booking.getPickupLocation(),
                booking.getDeliveryLocation(),
                booking.getScheduledDate(),
                booking.getTotalCost(),
                booking.getStatus()
        );
    }
}
