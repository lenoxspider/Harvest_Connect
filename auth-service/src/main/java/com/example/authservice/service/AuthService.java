package com.example.authservice.service;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.RefreshTokenRequest;
import com.example.authservice.dto.RegisterRequest;
import com.example.authservice.entity.User;
import com.example.authservice.repository.UserRepository;
import com.example.authservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .region(request.getRegion())
                .build();
        repository.save(user);

        String jwtToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhoneNumber(), request.getPassword())
        );
        User user = repository.findByPhoneNumber(request.getPhoneNumber()).orElseThrow();
        String jwtToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String phoneNumber = jwtService.extractPhoneNumber(request.getRefreshToken());
        if (phoneNumber != null) {
            User user = repository.findByPhoneNumber(phoneNumber).orElseThrow();
            if (jwtService.isTokenValid(request.getRefreshToken(), user)) {
                String accessToken = jwtService.generateAccessToken(user);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(request.getRefreshToken())
                        .build();
            }
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }
}

