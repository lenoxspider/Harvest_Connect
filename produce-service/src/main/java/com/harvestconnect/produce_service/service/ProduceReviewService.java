package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateReviewRequest;
import com.harvestconnect.produce_service.dto.ReviewResponse;
import com.harvestconnect.produce_service.entity.ProduceReview;
import com.harvestconnect.produce_service.repository.ProduceReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProduceReviewService {

    private final ProduceReviewRepository reviewRepository;

    public ProduceReviewService(ProduceReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public ReviewResponse submitReview(UUID listingId, UUID reviewerId, CreateReviewRequest request) {
        // Prevent duplicate reviews from the same user for the same listing
        if (reviewRepository.existsByListingIdAndReviewerId(listingId, reviewerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You have already submitted a review for this listing.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5.");
        }

        ProduceReview review = new ProduceReview();
        review.setListingId(listingId);
        review.setReviewerId(reviewerId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        ProduceReview saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public List<ReviewResponse> getReviewsForListing(UUID listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse toResponse(ProduceReview r) {
        return new ReviewResponse(
                r.getId(),
                r.getListingId(),
                r.getReviewerId(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
