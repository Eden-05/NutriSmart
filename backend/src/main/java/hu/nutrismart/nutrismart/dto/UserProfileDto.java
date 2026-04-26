package hu.nutrismart.nutrismart.dto;

import jakarta.validation.constraints.*;

public record UserProfileDto(
        Long id,
        String email,
        @NotBlank @Size(max = 35) String fullName,
        @NotBlank @Size(max = 20) String gender,
        @Min(12) @Max(120) Integer age,
        @NotNull @Min(100) @Max(250) Integer heightCm,
        @NotNull @Min(30) @Max(400) Double weightKg,
        @Min(30) @Max(400) Double startingWeightKg,
        @Min(30) @Max(400) Double currentWeightKg,
        @Min(30) @Max(400) Double targetWeightKg,
        @Min(500) @Max(6000) Integer waterGoalMl,
        @Min(2) @Max(6) Integer mealsPerDay,
        @DecimalMin("4.0") @DecimalMax("12.0") Double sleepGoalHours,
        @NotBlank @Size(max = 30) String goal,
        @NotBlank @Size(max = 30) String activityLevel,
        @NotNull Boolean vegetarianEnabled
) {}
