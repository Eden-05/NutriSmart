package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.RecipeDto;
import hu.nutrismart.nutrismart.entity.Food;
import hu.nutrismart.nutrismart.entity.Recipe;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.RecipeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {
    @Mock RecipeRepository recipeRepository;
    @Mock FoodService foodService;
    @InjectMocks RecipeService recipeService;

    @Test
    void createRecipeBuildsIngredientsCalculatesTotalsAndVegetarianFlag() {
        Food oat = food(1L, "Zab", true, 380, 13.0, 62.0, 7.0);
        Food milk = food(2L, "Tej", false, 60, 3.4, 4.8, 3.0);
        when(foodService.findFoodById(1L)).thenReturn(oat);
        when(foodService.findFoodById(2L)).thenReturn(milk);
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(invocation -> {
            Recipe recipe = invocation.getArgument(0);
            recipe.setId(9L);
            return recipe;
        });

        RecipeDto result = recipeService.createRecipe(new RecipeDto(
                null,
                "  Zabkása  ",
                " REGGELI ",
                true,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of(
                        new RecipeDto.RecipeIngredientDto(null, 1L, null, 50.04, null, null, null, null, null),
                        new RecipeDto.RecipeIngredientDto(null, 2L, null, 200.0, 5, null, null, null, null)
                )
        ));

        ArgumentCaptor<Recipe> captor = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository).save(captor.capture());
        Recipe saved = captor.getValue();

        assertThat(saved.getName()).isEqualTo("Zabkása");
        assertThat(saved.getMealType()).isEqualTo("reggeli");
        assertThat(saved.getActive()).isTrue();
        assertThat(saved.getVegetarian()).isFalse();
        assertThat(saved.getIngredients()).hasSize(2);
        assertThat(saved.getIngredients().get(0).getQuantityG()).isEqualTo(50.0);
        assertThat(saved.getIngredients().get(1).getItemOrder()).isEqualTo(5);
        assertThat(result.id()).isEqualTo(9L);
        assertThat(result.totalQuantityG()).isEqualTo(250.0);
        assertThat(result.totalCalories()).isEqualTo(310);
        assertThat(result.ingredients()).extracting(RecipeDto.RecipeIngredientDto::foodName).containsExactly("Zab", "Tej");
    }

    @Test
    void createRecipeRejectsDuplicateFoodsMissingFoodAndSmallQuantity() {
        RecipeDto duplicate = dto(List.of(
                new RecipeDto.RecipeIngredientDto(null, 1L, null, 25.0, null, null, null, null, null),
                new RecipeDto.RecipeIngredientDto(null, 1L, null, 30.0, null, null, null, null, null)
        ));
        when(foodService.findFoodById(1L)).thenReturn(food(1L, "Zab", true, 380, 13, 62, 7));
        assertThatThrownBy(() -> recipeService.createRecipe(duplicate))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("csak egyszer");

        RecipeDto missingFood = dto(List.of(new RecipeDto.RecipeIngredientDto(null, null, null, 25.0, null, null, null, null, null)));
        assertThatThrownBy(() -> recipeService.createRecipe(missingFood))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ételnek");

        RecipeDto tooSmall = dto(List.of(new RecipeDto.RecipeIngredientDto(null, 1L, null, 4.9, null, null, null, null, null)));
        assertThatThrownBy(() -> recipeService.createRecipe(tooSmall))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("legalább 5 g");
    }

    @Test
    void getRecipesForMealFiltersInactiveEmptyAndNonVegetarianWhenNeeded() {
        Recipe vegetarian = recipe(1L, "Vega", true, true, food(1L, "Tofu", true, 120, 13, 2, 6));
        Recipe meat = recipe(2L, "Csirke", false, true, food(2L, "Csirke", false, 160, 30, 0, 3));
        Recipe empty = recipe(3L, "Üres", true, true);
        when(recipeRepository.findByActiveTrueAndMealTypeIgnoreCase("ebéd")).thenReturn(List.of(meat, empty, vegetarian));

        assertThat(recipeService.getRecipesForMeal("ebéd", true)).extracting(Recipe::getName).containsExactly("Vega");
        assertThat(recipeService.getRecipesForMeal("ebéd", false)).extracting(Recipe::getName).containsExactly("Vega", "Csirke");
    }

    @Test
    void getRecipeByIdThrowsWhenMissing() {
        when(recipeRepository.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> recipeService.getRecipeById(404L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("404");
    }

    private RecipeDto dto(List<RecipeDto.RecipeIngredientDto> ingredients) {
        return new RecipeDto(null, "Recept", "ebéd", null, true, null, null, null, null, null, ingredients);
    }

    private Recipe recipe(Long id, String name, boolean vegetarian, boolean active, Food... foods) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setMealType("ebéd");
        recipe.setVegetarian(vegetarian);
        recipe.setActive(active);
        for (int i = 0; i < foods.length; i++) {
            var ingredient = new hu.nutrismart.nutrismart.entity.RecipeIngredient();
            ingredient.setRecipe(recipe);
            ingredient.setFood(foods[i]);
            ingredient.setQuantityG(100.0);
            ingredient.setItemOrder(i + 1);
            recipe.getIngredients().add(ingredient);
        }
        return recipe;
    }

    private Food food(Long id, String name, boolean vegetarian, double kcal, double protein, double carbs, double fat) {
        Food food = new Food();
        food.setId(id);
        food.setName(name);
        food.setCategory("cat");
        food.setRecommendedMeals("reggeli,ebéd");
        food.setMacroRole("protein");
        food.setImageUrl("/img.jpg");
        food.setCaloriesPer100g((int) kcal);
        food.setProteinPer100g(protein);
        food.setCarbsPer100g(carbs);
        food.setFatPer100g(fat);
        food.setVegetarian(vegetarian);
        food.setActive(true);
        return food;
    }
}
