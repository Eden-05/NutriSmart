package hu.nutrismart.nutrismart.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FoodDto(
        Long id,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 80) String category,
        @NotNull @Size(min = 1) List<String> recommendedMeals,
        @NotBlank @Size(max = 20) String macroRole,
        @Size(max = 255) String imageUrl,
        @NotNull @Min(1) Integer caloriesPer100g,
        @NotNull @Min(0) Double proteinPer100g,
        @NotNull @Min(0) Double carbsPer100g,
        @NotNull @Min(0) Double fatPer100g,
        Boolean vegetarian,
        Boolean active
) {}
