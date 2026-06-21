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

    @PutMapping("/{id}/accept")
    public ProduceOrder acceptOrder(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        JwtClaimsReader.Claims claims = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        if (claims.role() == null || !claims.role().equalsIgnoreCase("FARMER")) {
            throw new IllegalStateException("Only FARMER can accept orders");
        }
        return produceOrderService.acceptOrder(id, claims.userUuid());
    }

    @PutMapping("/{id}/decline")
    public ProduceOrder declineOrder(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        JwtClaimsReader.Claims claims = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        if (claims.role() == null || !claims.role().equalsIgnoreCase("FARMER")) {
            throw new IllegalStateException("Only FARMER can decline orders");
        }
        return produceOrderService.declineOrder(id, claims.userUuid());
    }
}
