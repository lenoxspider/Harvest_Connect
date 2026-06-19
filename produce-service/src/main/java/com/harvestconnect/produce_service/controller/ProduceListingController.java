package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateListingRequest;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.security.JwtClaimsReader;
import com.harvestconnect.produce_service.service.ProduceListingService;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/produce/listings")
public class ProduceListingController {

    private final ProduceListingService produceListingService;
    private final JwtClaimsReader jwtClaimsReader;

    public ProduceListingController(ProduceListingService produceListingService, JwtClaimsReader jwtClaimsReader) {
        this.produceListingService = produceListingService;
        this.jwtClaimsReader = jwtClaimsReader;
    }

    @GetMapping
    public List<ProduceListing> getAllListings() {
        return produceListingService.getAllListings();
    }

    @GetMapping("/{id}")
    public ProduceListing getListing(@PathVariable UUID id) {
        return produceListingService.getListingById(id);
    }

    @GetMapping("/my")
    public List<ProduceListing> getMyListings(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization
    ) {
        UUID farmerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceListingService.getListingsForFarmer(farmerId);
    }

    @PostMapping
    public ProduceListing createListing(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody CreateListingRequest request
    ) {
        UUID farmerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceListingService.createListing(farmerId, request);
    }

    @PutMapping("/{id}")
    public ProduceListing updateListing(
            @PathVariable UUID id,
            @RequestBody ProduceListing updatedListing
    ) {
        return produceListingService.updateListing(id, updatedListing);
    }

    @DeleteMapping("/{id}")
    public String deleteListing(@PathVariable UUID id) {
        produceListingService.deleteListing(id);
        return "Listing deleted successfully";
    }
}

