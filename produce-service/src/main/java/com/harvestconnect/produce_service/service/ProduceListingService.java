package com.harvestconnect.produce_service.service;

import com.harvestconnect.produce_service.dto.CreateListingRequest;
import com.harvestconnect.produce_service.entity.ProduceListing;
import com.harvestconnect.produce_service.exception.ResourceNotFoundException;
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

    public ProduceListing createListing(UUID farmerId, CreateListingRequest request) {
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
        return produceListingRepository.save(listing);
    }

    public List<ProduceListing> getAllListings() {
        return produceListingRepository.findAll();
    }

    public List<ProduceListing> getListingsForFarmer(UUID farmerId) {
        return produceListingRepository.findByFarmerId(farmerId);
    }

    public List<String> getCategories() {
        return produceListingRepository.findDistinctCategories();
    }

    public ProduceListing getListingById(UUID id) {
        return produceListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
    }

    public ProduceListing updateListing(UUID id, ProduceListing updatedListing) {
        ProduceListing existing = getListingById(id);

        existing.setTitle(updatedListing.getTitle());
        existing.setDescription(updatedListing.getDescription());
        existing.setCategory(updatedListing.getCategory());
        existing.setQuantityKg(updatedListing.getQuantityKg());
        existing.setPricePerKg(updatedListing.getPricePerKg());
        existing.setLocation(updatedListing.getLocation());
        existing.setLatitude(updatedListing.getLatitude());
        existing.setLongitude(updatedListing.getLongitude());
        existing.setImages(updatedListing.getImages());

        return produceListingRepository.save(existing);
    }

    public void deleteListing(UUID id) {
        produceListingRepository.deleteById(id);
    }
}

