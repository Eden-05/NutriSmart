package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.RecipeDto;
import hu.nutrismart.nutrismart.entity.Food;
import hu.nutrismart.nutrismart.entity.Recipe;
import hu.nutrismart.nutrismart.entity.RecipeIngredient;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final FoodService foodService;

    public RecipeService(RecipeRepository recipeRepository, FoodService foodService) {
        this.recipeRepository = recipeRepository;
        this.foodService = foodService;
    }

    public List<RecipeDto> getAllRecipes() {
        return recipeRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<Recipe> getRecipesForMeal(String mealType, boolean vegetarianOnly) {
        return recipeRepository.findByActiveTrueAndMealTypeIgnoreCase(mealType).stream()
                .filter(recipe -> !vegetarianOnly || Boolean.TRUE.equals(recipe.getVegetarian()))
                .filter(recipe -> !recipe.getIngredients().isEmpty())
                .sorted(Comparator.comparing(Recipe::getId))
                .toList();
    }

    public Recipe getRecipeById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Recept nem található: " + id));
    }

    @Transactional
    public RecipeDto createRecipe(RecipeDto dto) {
        Recipe recipe = new Recipe();
        apply(recipe, dto);
        return toDto(recipeRepository.save(recipe));
    }

    @Transactional
    public RecipeDto updateRecipe(Long id, RecipeDto dto) {
        Recipe recipe = getRecipeById(id);
        apply(recipe, dto);
        return toDto(recipeRepository.save(recipe));
    }

    @Transactional
    public void deleteRecipe(Long id) {
        Recipe recipe = getRecipeById(id);
        recipeRepository.delete(recipe);
    }

    private void apply(Recipe recipe, RecipeDto dto) {
        String name = dto.name() == null ? "" : dto.name().trim();
        String mealType = dto.mealType() == null ? "" : dto.mealType().trim().toLowerCase();

        if (name.isBlank()) throw new BadRequestException("A recept neve kötelező.");
        if (mealType.isBlank()) throw new BadRequestException("Az étkezés típusa kötelező.");
        if (dto.ingredients() == null || dto.ingredients().isEmpty()) throw new BadRequestException("Legalább egy összetevőt meg kell adni.");

        recipe.setName(name);
        recipe.setMealType(mealType);
        recipe.setActive(dto.active() == null || dto.active());
        recipe.getIngredients().clear();

        List<RecipeIngredient> ingredients = new ArrayList<>();
        Set<Long> seenFoodIds = new HashSet<>();
        int order = 1;
        boolean vegetarian = true;

        for (RecipeDto.RecipeIngredientDto ingredientDto : dto.ingredients()) {
            if (ingredientDto.foodId() == null) throw new BadRequestException("Minden összetevőhöz tartoznia kell ételnek.");
            if (ingredientDto.quantityG() == null || ingredientDto.quantityG() < 5) throw new BadRequestException("Az összetevő mennyisége legalább 5 g kell legyen.");
            if (!seenFoodIds.add(ingredientDto.foodId())) throw new BadRequestException("Ugyanaz az étel csak egyszer szerepelhet egy recepten belül.");

            Food food = foodService.findFoodById(ingredientDto.foodId());
            RecipeIngredient ingredient = new RecipeIngredient();
            ingredient.setRecipe(recipe);
            ingredient.setFood(food);
            ingredient.setQuantityG(round1(ingredientDto.quantityG()));
            ingredient.setItemOrder(ingredientDto.itemOrder() != null ? ingredientDto.itemOrder() : order);
            ingredients.add(ingredient);
            vegetarian = vegetarian && Boolean.TRUE.equals(food.getVegetarian());
            order++;
        }

        recipe.setVegetarian(dto.vegetarian() != null ? dto.vegetarian() && vegetarian : vegetarian);
        recipe.getIngredients().addAll(ingredients);
    }

    public RecipeDto toDto(Recipe recipe) {
        List<RecipeDto.RecipeIngredientDto> ingredients = recipe.getIngredients().stream()
                .sorted(Comparator.comparing(RecipeIngredient::getItemOrder))
                .map(this::toIngredientDto)
                .toList();
        double totalQuantity = ingredients.stream().mapToDouble(i -> i.quantityG() == null ? 0 : i.quantityG()).sum();
        int totalCalories = ingredients.stream().mapToInt(i -> i.calories() == null ? 0 : i.calories()).sum();
        double totalProtein = ingredients.stream().mapToDouble(i -> i.proteinG() == null ? 0 : i.proteinG()).sum();
        double totalCarbs = ingredients.stream().mapToDouble(i -> i.carbsG() == null ? 0 : i.carbsG()).sum();
        double totalFat = ingredients.stream().mapToDouble(i -> i.fatG() == null ? 0 : i.fatG()).sum();
        return new RecipeDto(recipe.getId(), recipe.getName(), recipe.getMealType(), recipe.getVegetarian(), recipe.getActive(), round1(totalQuantity), totalCalories, round1(totalProtein), round1(totalCarbs), round1(totalFat), ingredients);
    }

    private RecipeDto.RecipeIngredientDto toIngredientDto(RecipeIngredient ingredient) {
        Food food = ingredient.getFood();
        double q = ingredient.getQuantityG();
        return new RecipeDto.RecipeIngredientDto(ingredient.getId(), food.getId(), food.getName(), round1(q), ingredient.getItemOrder(), (int) Math.round(food.getCaloriesPer100g() * q / 100.0), round1(food.getProteinPer100g() * q / 100.0), round1(food.getCarbsPer100g() * q / 100.0), round1(food.getFatPer100g() * q / 100.0));
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
