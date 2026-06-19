package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateListingRequest;
import com.harvestconnect.produce_service.dto.ListingResponse;
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

    @PostMapping
    public ListingResponse create(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
                                  @RequestBody CreateListingRequest request) {
        UUID farmerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceListingService.createListing(farmerId, request);
    }

    @GetMapping
    public List<ListingResponse> getAll() {
        return produceListingService.getAllListings();
    }

    @GetMapping("/my")
    public List<ListingResponse> getMine(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        UUID farmerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceListingService.getListingsForFarmer(farmerId);
    }

    @GetMapping("/{id}")
    public ListingResponse getById(@PathVariable UUID id) {
        return produceListingService.getListing(id);
    }
}
