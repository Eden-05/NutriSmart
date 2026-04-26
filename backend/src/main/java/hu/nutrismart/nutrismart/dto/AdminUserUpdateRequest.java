package hu.nutrismart.nutrismart.dto;

import hu.nutrismart.nutrismart.entity.Role;
import jakarta.validation.constraints.NotNull;

public record AdminUserUpdateRequest(
        @NotNull Role role,
        @NotNull Boolean active
) {}
