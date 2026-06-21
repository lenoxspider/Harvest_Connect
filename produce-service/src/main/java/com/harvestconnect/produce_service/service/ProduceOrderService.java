package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateOrderRequest;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.enums.OrderStatus;
import com.harvestconnect.produce_service.exception.ResourceNotFoundException;
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

    public ProduceOrder placeOrder(UUID buyerId, CreateOrderRequest request) {
        ProduceListing listing = produceListingRepository
                .findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getQuantityKg() != null && request.getQuantityKg() != null && listing.getQuantityKg() < request.getQuantityKg()) {
            throw new RuntimeException("Insufficient quantity available");
        }

        ProduceOrder order = new ProduceOrder();
        order.setListingId(listing.getId());
        order.setBuyerId(buyerId);
        order.setQuantityKg(request.getQuantityKg());

        if (listing.getPricePerKg() != null && request.getQuantityKg() != null) {
            BigDecimal totalPrice = listing.getPricePerKg().multiply(BigDecimal.valueOf(request.getQuantityKg()));
            order.setTotalPrice(totalPrice);
        }

        order.setStatus(OrderStatus.PENDING);

        if (listing.getQuantityKg() != null && request.getQuantityKg() != null) {
            listing.setQuantityKg(listing.getQuantityKg() - request.getQuantityKg());
            produceListingRepository.save(listing);
        }

        return produceOrderRepository.save(order);
    }

    public List<ProduceOrder> getOrdersForUser(UUID userId, String role) {
        if (role != null && role.equalsIgnoreCase("FARMER")) {
            List<UUID> listingIds = produceListingRepository.findByFarmerId(userId).stream()
                    .map(ProduceListing::getId)
                    .toList();
            if (listingIds.isEmpty()) {
                return List.of();
            }
            return produceOrderRepository.findByListingIdIn(listingIds);
        }

        return produceOrderRepository.findByBuyerId(userId);
    }

    public ProduceOrder acceptOrder(UUID orderId, UUID farmerId) {
        return updateOrderStatus(orderId, farmerId, OrderStatus.CONFIRMED);
    }

    public ProduceOrder declineOrder(UUID orderId, UUID farmerId) {
        return updateOrderStatus(orderId, farmerId, OrderStatus.CANCELLED);
    }

    private ProduceOrder updateOrderStatus(UUID orderId, UUID farmerId, OrderStatus newStatus) {
        ProduceOrder order = produceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        ProduceListing listing = produceListingRepository.findById(order.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getFarmerId().equals(farmerId)) {
            throw new IllegalStateException("You are not allowed to modify this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING orders can be updated");
        }

        if (newStatus == OrderStatus.CANCELLED && listing.getQuantityKg() != null && order.getQuantityKg() != null) {
            listing.setQuantityKg(listing.getQuantityKg() + order.getQuantityKg());
            produceListingRepository.save(listing);
        }

        order.setStatus(newStatus);
        return produceOrderRepository.save(order);
    }
}
