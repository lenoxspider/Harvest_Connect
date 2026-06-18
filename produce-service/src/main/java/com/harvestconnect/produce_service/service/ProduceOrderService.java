package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.repository.ProduceOrderRepository;
import org.springframework.stereotype.Service;

@Service
public class ProduceOrderService {

    private final ProduceOrderRepository produceOrderRepository;

    public ProduceOrderService(ProduceOrderRepository produceOrderRepository) {
        this.produceOrderRepository = produceOrderRepository;
    }

}
