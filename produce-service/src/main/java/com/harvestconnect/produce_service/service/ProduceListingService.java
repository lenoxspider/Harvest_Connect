package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.repository.ProduceListingRepository;
import org.springframework.stereotype.Service;

@Service
public class ProduceListingService {

    private final ProduceListingRepository produceListingRepository;

    public ProduceListingService(ProduceListingRepository produceListingRepository) {
        this.produceListingRepository = produceListingRepository;
    }

}
