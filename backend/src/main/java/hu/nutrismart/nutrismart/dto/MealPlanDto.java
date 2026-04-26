package hu.nutrismart.nutrismart.dto;

import java.time.LocalDate;
import java.util.List;

public record MealPlanDto(
        Long id,
        Long userId,
        LocalDate date,
        Integer targetCalories,
        Integer totalCalories,
        Double totalProteinG,
        Double totalCarbsG,
        Double totalFatG,
        List<MealSectionDto> meals
) {
    public record MealSectionDto(
            String mealType,
            String mealLabel,
            String recipeName,
            Integer targetCalories,
            Integer totalCalories,
            Double totalProteinG,
            Double totalCarbsG,
            Double totalFatG,
            String imageUrl,
            List<MealItemDto> items
    ) {}
    public record MealItemDto(
            Long id,
            Long foodId,
            String foodName,
            String category,
            Double quantityG,
            Integer calories,
            Double proteinG,
            Double carbsG,
            Double fatG,
            String imageUrl
    ) {}
}
