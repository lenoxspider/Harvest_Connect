package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateOrderRequest;
import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.security.JwtClaimsReader;
import com.harvestconnect.produce_service.service.ProduceOrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/produce/orders")
public class ProduceOrderController {

    private final ProduceOrderService produceOrderService;
    private final JwtClaimsReader jwtClaimsReader;

    public ProduceOrderController(ProduceOrderService produceOrderService, JwtClaimsReader jwtClaimsReader) {
        this.produceOrderService = produceOrderService;
        this.jwtClaimsReader = jwtClaimsReader;
    }

    @PostMapping
    public ProduceOrder placeOrder(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody CreateOrderRequest request
    ) {
        UUID buyerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceOrderService.placeOrder(buyerId, request);
    }

    @GetMapping("/my")
    public List<ProduceOrder> getMyOrders(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization
    ) {
        JwtClaimsReader.Claims claims = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return produceOrderService.getOrdersForUser(claims.userUuid(), claims.role());
    }
}

