package hu.nutrismart.nutrismart.dto;

import hu.nutrismart.nutrismart.entity.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        Boolean active,
        LocalDateTime createdAt
) {}
