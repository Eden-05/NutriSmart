package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.FoodDto;
import hu.nutrismart.nutrismart.entity.Food;
import hu.nutrismart.nutrismart.entity.Recipe;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.FoodRepository;
import hu.nutrismart.nutrismart.repository.MealPlanItemRepository;
import hu.nutrismart.nutrismart.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodService {
    private final FoodRepository foodRepository;
    private final RecipeRepository recipeRepository;
    private final MealPlanItemRepository mealPlanItemRepository;

    public FoodService(FoodRepository foodRepository, RecipeRepository recipeRepository, MealPlanItemRepository mealPlanItemRepository) {
        this.foodRepository = foodRepository;
        this.recipeRepository = recipeRepository;
        this.mealPlanItemRepository = mealPlanItemRepository;
    }

    public List<FoodDto> getAllFoods() {
        return foodRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<Food> getActiveFoods() {
        return foodRepository.findByActiveTrue();
    }

    @Transactional
    public FoodDto createFood(FoodDto dto) {
        Food food = new Food();
        apply(food, dto);
        return toDto(foodRepository.save(food));
    }

    @Transactional
    public FoodDto updateFood(Long id, FoodDto dto) {
        Food food = foodRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Étel nem található: " + id));
        apply(food, dto);
        return toDto(foodRepository.save(food));
    }

    @Transactional
    public void deleteFood(Long id) {
        Food food = findFoodById(id);
        List<Recipe> recipesUsingFood = recipeRepository.findByIngredients_Food_Id(id);
        recipeRepository.deleteAll(recipesUsingFood);
        mealPlanItemRepository.deleteByFood_Id(id);
        foodRepository.delete(food);
    }

    public Food findFoodByName(String name) {
        return foodRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new NotFoundException("Hiányzó étel az adatbázisból: " + name));
    }

    public Food findFoodById(Long id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Étel nem található: " + id));
    }

    private void apply(Food food, FoodDto dto) {
        String name = dto.name() == null ? "" : dto.name().trim();
        String category = dto.category() == null ? "" : dto.category().trim();
        String macroRole = dto.macroRole() == null ? "" : dto.macroRole().trim().toLowerCase();
        List<String> recommendedMeals = dto.recommendedMeals() == null
                ? List.of()
                : dto.recommendedMeals().stream()
                .filter(meal -> meal != null && !meal.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        if (name.isBlank()) throw new BadRequestException("Az étel neve kötelező.");
        if (macroRole.isBlank()) throw new BadRequestException("A makró szerep kötelező.");
        if (recommendedMeals.isEmpty()) throw new BadRequestException("Legalább egy ajánlott étkezést meg kell adni.");
        if (dto.caloriesPer100g() == null || dto.caloriesPer100g() < 1) throw new BadRequestException("A kalória értékének legalább 1-nek kell lennie.");
        if (dto.proteinPer100g() == null || dto.proteinPer100g() < 0 || dto.carbsPer100g() == null || dto.carbsPer100g() < 0 || dto.fatPer100g() == null || dto.fatPer100g() < 0) {
            throw new BadRequestException("A makró értékek nem lehetnek negatívak.");
        }

        food.setName(name);
        food.setCategory(category);
        food.setRecommendedMeals(String.join(",", recommendedMeals));
        food.setMacroRole(macroRole);
        food.setImageUrl((dto.imageUrl() == null || dto.imageUrl().isBlank()) ? "" : dto.imageUrl().trim());
        food.setCaloriesPer100g(dto.caloriesPer100g());
        food.setProteinPer100g(dto.proteinPer100g());
        food.setCarbsPer100g(dto.carbsPer100g());
        food.setFatPer100g(dto.fatPer100g());
        food.setVegetarian(Boolean.TRUE.equals(dto.vegetarian()));
        food.setActive(dto.active() == null || dto.active());
    }

    private FoodDto toDto(Food food) {
        return new FoodDto(
                food.getId(),
                food.getName(),
                food.getCategory(),
                food.recommendedMealList(),
                food.getMacroRole(),
                food.getImageUrl(),
                food.getCaloriesPer100g(),
                food.getProteinPer100g(),
                food.getCarbsPer100g(),
                food.getFatPer100g(),
                food.getVegetarian(),
                food.getActive()
        );
    }
}
