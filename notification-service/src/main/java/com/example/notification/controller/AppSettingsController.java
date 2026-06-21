package com.example.notification.controller;

import com.example.notification.dto.HomepageSettingsDto;
import com.example.notification.service.AppSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications/settings")
public class AppSettingsController {

    private final AppSettingsService appSettingsService;

    public AppSettingsController(AppSettingsService appSettingsService) {
        this.appSettingsService = appSettingsService;
    }

    @GetMapping("/homepage")
    public ResponseEntity<HomepageSettingsDto> getHomepage() {
        return ResponseEntity.ok(appSettingsService.getHomepageSettings());
    }

    @PutMapping("/homepage")
    public ResponseEntity<HomepageSettingsDto> putHomepage(@RequestBody HomepageSettingsDto dto) {
        return ResponseEntity.ok(appSettingsService.saveHomepageSettings(dto));
    }
}

