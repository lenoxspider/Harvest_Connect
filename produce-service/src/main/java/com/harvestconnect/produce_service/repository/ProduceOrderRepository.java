package com.harvestconnect.produce_service.repository;

import com.harvestconnect.produce_service.entity.ProduceOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProduceOrderRepository extends JpaRepository<ProduceOrder, UUID> {
    List<ProduceOrder> findByBuyerId(UUID buyerId);

    List<ProduceOrder> findByListingIdIn(List<UUID> listingIds);
}
