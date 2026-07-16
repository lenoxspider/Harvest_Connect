package com.harvestconnect.produce_service.repository;

import com.harvestconnect.produce_service.entity.ProduceReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProduceReviewRepository extends JpaRepository<ProduceReview, UUID> {
    List<ProduceReview> findByListingIdOrderByCreatedAtDesc(UUID listingId);
    boolean existsByListingIdAndReviewerId(UUID listingId, UUID reviewerId);
}
