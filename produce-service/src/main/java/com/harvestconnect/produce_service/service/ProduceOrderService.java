package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateOrderRequest;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.enums.OrderStatus;
import com.harvestconnect.produce_service.repository.ProduceListingRepository;
import com.harvestconnect.produce_service.repository.ProduceOrderRepository;
import com.harvestconnect.produce_service.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProduceOrderService {

    private final ProduceOrderRepository produceOrderRepository;
    private final ProduceListingRepository produceListingRepository;

    public ProduceOrderService(ProduceOrderRepository produceOrderRepository, ProduceListingRepository produceListingRepository) {
        this.produceListingRepository = produceListingRepository;
        this.produceOrderRepository = produceOrderRepository;
    }

    public ProduceOrder placeOrder(CreateOrderRequest request) {

    ProduceListing listing = produceListingRepository
            .findById(request.getListingId())
            .orElseThrow(() ->
                    new ResourceNotFoundException("Listing not found"));

    if (listing.getQuantityKg() < request.getQuantityKg()) {
        throw new RuntimeException("Insufficient quantity available");
    }

    ProduceOrder order = new ProduceOrder();

    order.setListingId(listing.getId());
    order.setQuantityKg(request.getQuantityKg());

    BigDecimal totalPrice =
            listing.getPricePerKg()
                    .multiply(BigDecimal.valueOf(request.getQuantityKg()));

    order.setTotalPrice(totalPrice);

    order.setStatus(OrderStatus.PENDING);

    listing.setQuantityKg(
            listing.getQuantityKg() - request.getQuantityKg());

    produceListingRepository.save(listing);

    return produceOrderRepository.save(order);
}

    public List<ProduceOrder> getAllOrders() {
        return produceOrderRepository.findAll();
    }

    public ProduceOrder getOrderById(UUID id) {
        return produceOrderRepository.findById(id)
                .orElseThrow(() ->
        new ResourceNotFoundException("Order not found"));
    }

    public ProduceOrder updateOrder(ProduceOrder order) {
        return produceOrderRepository.save(order);
    }
}
