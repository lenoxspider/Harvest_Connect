package com.harvestconnect.produce_service.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtClaimsReader {

    private final ObjectMapper objectMapper;

    public JwtClaimsReader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Optional<Claims> readFromAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return Optional.empty();
        }

        String value = authorizationHeader.trim();
        if (value.toLowerCase().startsWith("bearer ")) {
            value = value.substring("bearer ".length()).trim();
        }

        String[] parts = value.split("\\.");
        if (parts.length < 2) {
            return Optional.empty();
        }

        try {
            String payloadJson = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(payloadJson);

            String phone = node.hasNonNull("sub") ? node.get("sub").asText() : null;
            String role = node.hasNonNull("role") ? node.get("role").asText() : null;

            if (phone == null || phone.isBlank()) {
                return Optional.empty();
            }

            UUID userUuid = UUID.nameUUIDFromBytes(phone.getBytes(StandardCharsets.UTF_8));
            return Optional.of(new Claims(phone, role, userUuid));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    public Optional<Claims> readFromHeaders(HttpHeaders headers) {
        if (headers == null) {
            return Optional.empty();
        }
        return readFromAuthorizationHeader(headers.getFirst(HttpHeaders.AUTHORIZATION));
    }

    private static byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    public record Claims(String phoneNumber, String role, UUID userUuid) {}
}

