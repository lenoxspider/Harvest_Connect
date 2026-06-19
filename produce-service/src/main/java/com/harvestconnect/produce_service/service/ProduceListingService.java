package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateListingRequest;
import com.harvestconnect.produce_service.dto.ListingResponse;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.repository.ProduceListingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProduceListingService {

    private final ProduceListingRepository produceListingRepository;

    public ProduceListingService(ProduceListingRepository produceListingRepository) {
        this.produceListingRepository = produceListingRepository;
    }

    public ListingResponse createListing(UUID farmerId, CreateListingRequest request) {
        ProduceListing listing = new ProduceListing();
        listing.setFarmerId(farmerId);
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setQuantityKg(request.getQuantityKg());
        listing.setPricePerKg(request.getPricePerKg());
        listing.setLocation(request.getLocation());
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());
        listing.setImages(request.getImages());
        ProduceListing saved = produceListingRepository.save(listing);
        return toResponse(saved);
    }

    public List<ListingResponse> getAllListings() {
        return produceListingRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<ListingResponse> getListingsForFarmer(UUID farmerId) {
        return produceListingRepository.findByFarmerId(farmerId).stream().map(this::toResponse).toList();
    }

    public ListingResponse getListing(UUID id) {
        ProduceListing listing = produceListingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        return toResponse(listing);
    }

    private ListingResponse toResponse(ProduceListing listing) {
        ListingResponse resp = new ListingResponse();
        resp.setId(listing.getId());
        resp.setTitle(listing.getTitle());
        resp.setDescription(listing.getDescription());
        resp.setCategory(listing.getCategory());
        resp.setQuantityKg(listing.getQuantityKg());
        resp.setPricePerKg(listing.getPricePerKg());
        resp.setLocation(listing.getLocation());
        resp.setPremium(listing.getPremium());
        resp.setImages(listing.getImages());
        return resp;
    }
}
