package com.example.notification.service;

import com.example.notification.dto.HomepageSettingsDto;
import com.example.notification.entity.AppSetting;
import com.example.notification.repository.AppSettingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class AppSettingsService {

    private static final String HOMEPAGE_KEY = "homepage_images_v1";

    private final AppSettingRepository appSettingRepository;
    private final ObjectMapper objectMapper;

    public AppSettingsService(AppSettingRepository appSettingRepository, ObjectMapper objectMapper) {
        this.appSettingRepository = appSettingRepository;
        this.objectMapper = objectMapper;
    }

    public HomepageSettingsDto getHomepageSettings() {
        return appSettingRepository.findById(HOMEPAGE_KEY)
                .map(setting -> read(setting.getJsonValue()))
                .orElseGet(AppSettingsService::defaultHomepageSettings);
    }

    public HomepageSettingsDto saveHomepageSettings(HomepageSettingsDto dto) {
        String json = write(dto);
        appSettingRepository.save(new AppSetting(HOMEPAGE_KEY, json));
        return dto;
    }

    private HomepageSettingsDto read(String json) {
        try {
            return objectMapper.readValue(json, HomepageSettingsDto.class);
        } catch (Exception ex) {
            return defaultHomepageSettings();
        }
    }

    private String write(HomepageSettingsDto dto) {
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize homepage settings", ex);
        }
    }

    private static HomepageSettingsDto defaultHomepageSettings() {
        HomepageSettingsDto d = new HomepageSettingsDto();
        d.setCategoryStorageImage("https://picsum.photos/400/300?random=71");
        d.setCategoryProduceImage("https://picsum.photos/400/300?random=72");
        d.setCategoryTransportImage("https://picsum.photos/400/300?random=73");
        d.setCategoryLogisticsImage("https://picsum.photos/400/300?random=74");

        d.setHeroImage1("https://picsum.photos/800/450?random=81");
        d.setHeroImage2("https://picsum.photos/800/450?random=82");
        d.setHeroImage3("https://picsum.photos/800/450?random=83");
        d.setHeroImage4("https://picsum.photos/800/450?random=84");

        d.setFeaturedImage1("https://picsum.photos/400/300?random=91");
        d.setFeaturedImage2("https://picsum.photos/400/300?random=92");
        d.setFeaturedImage3("https://picsum.photos/400/300?random=93");
        return d;
    }
}

