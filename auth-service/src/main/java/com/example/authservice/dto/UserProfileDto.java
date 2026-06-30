package com.example.authservice.dto;

import com.example.authservice.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDto {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private Role role;
    private String region;
}

