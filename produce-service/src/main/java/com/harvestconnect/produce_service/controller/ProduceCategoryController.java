package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.service.ProduceListingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/produce/categories")
public class ProduceCategoryController {

    private final ProduceListingService produceListingService;

    public ProduceCategoryController(ProduceListingService produceListingService) {
        this.produceListingService = produceListingService;
    }

    @GetMapping
    public List<String> getCategories() {
        return produceListingService.getCategories();
    }
}
