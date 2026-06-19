package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateOrderRequest;
import com.harvestconnect.produce_service.dto.OrderResponse;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.enums.OrderStatus;
import com.harvestconnect.produce_service.repository.ProduceListingRepository;
import com.harvestconnect.produce_service.repository.ProduceOrderRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProduceOrderService {

    private final ProduceOrderRepository produceOrderRepository;
    private final ProduceListingRepository produceListingRepository;

    public ProduceOrderService(ProduceOrderRepository produceOrderRepository, ProduceListingRepository produceListingRepository) {
        this.produceOrderRepository = produceOrderRepository;
        this.produceListingRepository = produceListingRepository;
    }

    public OrderResponse placeOrder(UUID buyerId, CreateOrderRequest request) {
        ProduceListing listing = produceListingRepository.findById(request.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        BigDecimal totalPrice = listing.getPricePerKg()
                .multiply(BigDecimal.valueOf(request.getQuantityKg()));

        ProduceOrder order = new ProduceOrder();
        order.setListingId(listing.getId());
        order.setBuyerId(buyerId);
        order.setQuantityKg(request.getQuantityKg());
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);

        ProduceOrder saved = produceOrderRepository.save(order);
        return toResponse(saved);
    }

    public List<OrderResponse> getOrdersForUser(UUID userId, String role) {
        if (role != null && role.equalsIgnoreCase("FARMER")) {
            List<UUID> listingIds = produceListingRepository.findByFarmerId(userId).stream()
                    .map(ProduceListing::getId)
                    .toList();
            if (listingIds.isEmpty()) {
                return List.of();
            }
            return produceOrderRepository.findByListingIdIn(listingIds).stream().map(this::toResponse).toList();
        }

        // Default BUYER view
        return produceOrderRepository.findByBuyerId(userId).stream().map(this::toResponse).toList();
    }

    private OrderResponse toResponse(ProduceOrder order) {
        OrderResponse resp = new OrderResponse();
        resp.setId(order.getId());
        resp.setListingId(order.getListingId());
        resp.setQuantityKg(order.getQuantityKg());
        resp.setTotalPrice(order.getTotalPrice());
        resp.setStatus(order.getStatus());
        return resp;
    }
}
