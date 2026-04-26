package hu.nutrismart.nutrismart.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RecipeDto(
        Long id,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 30) String mealType,
        Boolean vegetarian,
        Boolean active,
        Double totalQuantityG,
        Integer totalCalories,
        Double totalProteinG,
        Double totalCarbsG,
        Double totalFatG,
        @NotNull @Size(min = 1) List<@Valid RecipeIngredientDto> ingredients
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RecipeIngredientDto(
            Long id,
            @NotNull Long foodId,
            String foodName,
            @NotNull @DecimalMin("5.0") Double quantityG,
            Integer itemOrder,
            Integer calories,
            Double proteinG,
            Double carbsG,
            Double fatG
    ) {}
}
