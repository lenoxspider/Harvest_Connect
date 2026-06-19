package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateOrderRequest;
import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.service.ProduceOrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/produce/orders")
public class ProduceOrderController {

    private final ProduceOrderService produceOrderService;

    public ProduceOrderController(ProduceOrderService produceOrderService) {
        this.produceOrderService = produceOrderService;
    }
    @PostMapping
public ProduceOrder placeOrder(
        @RequestBody CreateOrderRequest request) {

    return produceOrderService.placeOrder(request);
}
}
