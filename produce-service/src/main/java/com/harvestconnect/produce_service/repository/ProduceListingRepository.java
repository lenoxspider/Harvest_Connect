package com.harvestconnect.produce_service.repository;

import com.harvestconnect.produce_service.entity.ProduceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProduceListingRepository extends JpaRepository<ProduceListing, UUID> {
    List<ProduceListing> findByFarmerId(UUID farmerId);
    
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p.category FROM ProduceListing p")
    List<String> findDistinctCategories();
}
