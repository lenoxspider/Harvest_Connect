package com.harvestconnect.produce_service.dto;

import java.time.Instant;
import java.util.UUID;

public class ReviewResponse {
    private UUID id;
    private UUID listingId;
    private UUID reviewerId;
    private int rating;
    private String comment;
    private Instant createdAt;

    public ReviewResponse(UUID id, UUID listingId, UUID reviewerId, int rating, String comment, Instant createdAt) {
        this.id = id;
        this.listingId = listingId;
        this.reviewerId = reviewerId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getListingId() { return listingId; }
    public UUID getReviewerId() { return reviewerId; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public Instant getCreatedAt() { return createdAt; }
}
