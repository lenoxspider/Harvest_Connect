package com.harvestconnect.produce_service.controller;

import com.harvestconnect.produce_service.dto.CreateReviewRequest;
import com.harvestconnect.produce_service.dto.ReviewResponse;
import com.harvestconnect.produce_service.security.JwtClaimsReader;
import com.harvestconnect.produce_service.service.ProduceReviewService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Handles produce listing reviews.
 * Routes:
 *   POST /api/produce/listings/{listingId}/reviews  — submit a review
 *   GET  /api/produce/listings/{listingId}/reviews  — fetch all reviews for a listing
 */
@RestController
@RequestMapping("/api/produce/listings/{listingId}/reviews")
public class ProduceReviewController {

    private final ProduceReviewService reviewService;
    private final JwtClaimsReader jwtClaimsReader;

    public ProduceReviewController(ProduceReviewService reviewService, JwtClaimsReader jwtClaimsReader) {
        this.reviewService = reviewService;
        this.jwtClaimsReader = jwtClaimsReader;
    }

    /** Submit a review for a listing. Requires a valid JWT (buyer must be logged in). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse submitReview(
            @PathVariable UUID listingId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody CreateReviewRequest request
    ) {
        UUID reviewerId = jwtClaimsReader.readFromAuthorizationHeader(authorization)
                .map(JwtClaimsReader.Claims::userUuid)
                .orElseThrow(() -> new IllegalStateException("Missing/invalid Authorization token"));
        return reviewService.submitReview(listingId, reviewerId, request);
    }

    /** Fetch all reviews for a listing (public — no auth required). */
    @GetMapping
    public List<ReviewResponse> getReviews(@PathVariable UUID listingId) {
        return reviewService.getReviewsForListing(listingId);
    }
}
