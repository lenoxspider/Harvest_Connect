
package com.harvestconnect.produce_service.service;

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

    public ProduceListing createListing(ProduceListing listing) {
        return produceListingRepository.save(listing);
    }

    public List<ProduceListing> getAllListings() {
        return produceListingRepository.findAll();
    }

    public ProduceListing getListingById(UUID id) {
        return produceListingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
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