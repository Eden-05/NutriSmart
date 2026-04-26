package hu.nutrismart.nutrismart.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {}
