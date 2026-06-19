package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateListingRequest;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.service.ProduceListingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/produce/listings")
public class ProduceListingController {

    private final ProduceListingService produceListingService;

    public ProduceListingController(ProduceListingService produceListingService) {
        this.produceListingService = produceListingService;
    }
    @PostMapping
public ProduceListing createListing(
        @RequestBody CreateListingRequest request) {

    return produceListingService.createListing(request);
}
}


