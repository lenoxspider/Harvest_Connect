package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.entity.ProduceOrder;
import com.harvestconnect.produce_service.repository.ProduceOrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProduceOrderService {

    private final ProduceOrderRepository produceOrderRepository;

    public ProduceOrderService(ProduceOrderRepository produceOrderRepository) {
        this.produceOrderRepository = produceOrderRepository;
    }

    public ProduceOrder placeOrder(ProduceOrder order) {
        return produceOrderRepository.save(order);
    }

    public List<ProduceOrder> getAllOrders() {
        return produceOrderRepository.findAll();
    }

    public ProduceOrder getOrderById(UUID id) {
        return produceOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public ProduceOrder updateOrder(ProduceOrder order) {
        return produceOrderRepository.save(order);
    }
}
