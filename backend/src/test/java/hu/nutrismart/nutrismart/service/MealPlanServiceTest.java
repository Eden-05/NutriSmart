package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.MealPlanDto;
import hu.nutrismart.nutrismart.entity.Food;
import hu.nutrismart.nutrismart.entity.MealPlan;
import hu.nutrismart.nutrismart.entity.MealPlanItem;
import hu.nutrismart.nutrismart.entity.Recipe;
import hu.nutrismart.nutrismart.entity.RecipeIngredient;
import hu.nutrismart.nutrismart.entity.Role;
import hu.nutrismart.nutrismart.entity.User;
import hu.nutrismart.nutrismart.entity.UserProfile;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.MealPlanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {
    @Mock MealPlanRepository mealPlanRepository;
    @Mock UserService userService;
    @Mock RecipeService recipeService;
    @InjectMocks MealPlanService mealPlanService;

    @Test
    void getTodayPlanReturnsExistingPlanGroupedByMeals() {
        User user = user();
        UserProfile profile = profile(user, false);
        MealPlan existing = new MealPlan();
        existing.setId(10L);
        existing.setUser(user);
        existing.setPlanDate(LocalDate.now());
        existing.setItems(List.of(item(existing, recipe("Reggeli recept", "reggeli", food(1L, "Zab", 389)), 80, 1)));
        existing.setTotalCalories(311);
        existing.setTotalProteinG(13.5);
        existing.setTotalCarbsG(53.0);
        existing.setTotalFatG(5.5);
        when(mealPlanRepository.findByUserIdAndPlanDate(2L, LocalDate.now())).thenReturn(Optional.of(existing));
        when(userService.findProfileEntityByUserId(2L)).thenReturn(profile);

        MealPlanDto dto = mealPlanService.getTodayPlan(2L);

        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.userId()).isEqualTo(2L);
        assertThat(dto.meals()).hasSize(3);
        assertThat(dto.meals().get(0).mealType()).isEqualTo("reggeli");
        assertThat(dto.meals().get(0).recipeName()).isEqualTo("Reggeli recept");
        assertThat(dto.meals().get(0).items()).hasSize(1);
        assertThat(dto.meals().get(1).items()).isEmpty();
    }

    @Test
    void generatePlanDeletesExistingPlanAndAvoidsSameRecipeWhenAlternativeExists() {
        User user = user();
        UserProfile profile = profile(user, true);
        MealPlan oldPlan = new MealPlan();
        oldPlan.setUser(user);
        oldPlan.setPlanDate(LocalDate.now());
        oldPlan.setItems(List.of(
                item(oldPlan, recipe("Régi reggeli", "reggeli", food(1L, "Zab", 389)), 80, 1)
        ));
        Recipe oldBreakfast = recipe("Régi reggeli", "reggeli", food(1L, "Zab", 389));
        Recipe betterBreakfast = recipe("Új reggeli", "reggeli", food(2L, "Skyr", 63));
        Recipe lunch = recipe("Ebéd", "ebéd", food(3L, "Tofu", 144));
        Recipe dinner = recipe("Vacsora", "vacsora", food(4L, "Túró", 98));

        when(userService.findUserById(2L)).thenReturn(user);
        when(userService.findProfileEntityByUserId(2L)).thenReturn(profile);
        when(mealPlanRepository.findByUserIdAndPlanDate(2L, LocalDate.now())).thenReturn(Optional.of(oldPlan));
        when(recipeService.getRecipesForMeal("reggeli", true)).thenReturn(List.of(oldBreakfast, betterBreakfast));
        when(recipeService.getRecipesForMeal("ebéd", true)).thenReturn(List.of(lunch));
        when(recipeService.getRecipesForMeal("vacsora", true)).thenReturn(List.of(dinner));
        when(mealPlanRepository.save(any(MealPlan.class))).thenAnswer(invocation -> {
            MealPlan plan = invocation.getArgument(0);
            plan.setId(99L);
            return plan;
        });

        MealPlanDto dto = mealPlanService.generatePlan(2L);

        verify(mealPlanRepository).delete(oldPlan);
        verify(mealPlanRepository).flush();
        ArgumentCaptor<MealPlan> captor = ArgumentCaptor.forClass(MealPlan.class);
        verify(mealPlanRepository).save(captor.capture());
        assertThat(captor.getValue().getNotes()).isEqualTo("Vega étrend");
        assertThat(dto.meals()).extracting(MealPlanDto.MealSectionDto::recipeName)
                .containsExactly("Új reggeli", "Ebéd", "Vacsora");
        assertThat(dto.totalCalories()).isGreaterThan(0);
    }

    @Test
    void generatePlanThrowsWhenNoRecipeExistsForMeal() {
        User user = user();
        UserProfile profile = profile(user, false);
        when(userService.findUserById(2L)).thenReturn(user);
        when(userService.findProfileEntityByUserId(2L)).thenReturn(profile);
        when(mealPlanRepository.findByUserIdAndPlanDate(2L, LocalDate.now())).thenReturn(Optional.empty());
        when(recipeService.getRecipesForMeal("reggeli", false)).thenReturn(List.of());

        assertThatThrownBy(() -> mealPlanService.generatePlan(2L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("reggeli");
    }

    private User user() {
        User user = new User("user@nutrismart.hu", "hash", Role.USER);
        user.setId(2L);
        return user;
    }

    private UserProfile profile(User user, boolean vegetarian) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFullName("Demo User");
        profile.setGender("no");
        profile.setAge(29);
        profile.setHeightCm(175);
        profile.setWeightKg(74.0);
        profile.setGoal("fogyas");
        profile.setActivityLevel("kozepes");
        profile.setVegetarianEnabled(vegetarian);
        return profile;
    }

    private MealPlanItem item(MealPlan plan, Recipe recipe, double quantity, int order) {
        Food food = recipe.getIngredients().get(0).getFood();
        MealPlanItem item = new MealPlanItem();
        item.setMealPlan(plan);
        item.setFood(food);
        item.setMealType(recipe.getMealType());
        item.setRecipeName(recipe.getName());
        item.setRecipeImageUrl(food.getImageUrl());
        item.setQuantityG(quantity);
        item.setItemOrder(order);
        item.setCalories((int) Math.round(food.getCaloriesPer100g() * quantity / 100.0));
        item.setProteinG(10.0);
        item.setCarbsG(20.0);
        item.setFatG(5.0);
        return item;
    }

    private Recipe recipe(String name, String mealType, Food food) {
        Recipe recipe = new Recipe();
        recipe.setId((long) Math.abs(name.hashCode()));
        recipe.setName(name);
        recipe.setMealType(mealType);
        recipe.setVegetarian(true);
        recipe.setActive(true);
        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setRecipe(recipe);
        ingredient.setFood(food);
        ingredient.setQuantityG(100.0);
        ingredient.setItemOrder(1);
        recipe.getIngredients().add(ingredient);
        return recipe;
    }

    private Food food(Long id, String name, int calories) {
        Food food = new Food();
        food.setId(id);
        food.setName(name);
        food.setCategory("category");
        food.setRecommendedMeals("reggeli,ebéd,vacsora");
        food.setMacroRole("protein");
        food.setImageUrl("/img.jpg");
        food.setCaloriesPer100g(calories);
        food.setProteinPer100g(10.0);
        food.setCarbsPer100g(15.0);
        food.setFatPer100g(3.0);
        food.setVegetarian(true);
        food.setActive(true);
        return food;
    }
}
