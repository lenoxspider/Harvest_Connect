package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.service.ProduceOrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/produce/orders")
public class ProduceOrderController {

    private final ProduceOrderService produceOrderService;

    public ProduceOrderController(ProduceOrderService produceOrderService) {
        this.produceOrderService = produceOrderService;
    }
}
