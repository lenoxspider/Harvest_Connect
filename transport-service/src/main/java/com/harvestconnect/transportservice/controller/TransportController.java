package com.harvestconnect.transportservice.controller;

import com.harvestconnect.transportservice.dto.BookingRequest;
import com.harvestconnect.transportservice.dto.ListingRequest;
import com.harvestconnect.transportservice.model.Booking;
import com.harvestconnect.transportservice.model.TruckListing;
import com.harvestconnect.transportservice.service.TransportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transport")
@RequiredArgsConstructor
public class TransportController {
    private final TransportService transportService;

    @GetMapping("/listings")
    public List<TruckListing> getListings() {
        return transportService.listTrucks();
    }

    @PostMapping("/listings")
    public TruckListing createListing(@RequestBody ListingRequest request) {
        return transportService.createListing(request);
    }

    @PostMapping("/bookings")
    public Booking createBooking(@RequestBody BookingRequest request) {
        return transportService.createBooking(request);
    }
}

