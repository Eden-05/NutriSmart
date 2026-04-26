package hu.nutrismart.nutrismart.service;

import hu.nutrismart.nutrismart.dto.FoodDto;
import hu.nutrismart.nutrismart.entity.Food;
import hu.nutrismart.nutrismart.exception.BadRequestException;
import hu.nutrismart.nutrismart.exception.NotFoundException;
import hu.nutrismart.nutrismart.repository.FoodRepository;
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
class FoodServiceTest {

    @Mock
    private FoodRepository foodRepository;

    @InjectMocks
    private FoodService foodService;

    @Test
    void createFoodTrimsAndNormalizesInputBeforeSaving() {
        when(foodRepository.save(any(Food.class))).thenAnswer(invocation -> {
            Food food = invocation.getArgument(0);
            food.setId(12L);
            return food;
        });

        FoodDto result = foodService.createFood(new FoodDto(
                null,
                "  Zabkasa  ",
                "  gabona  ",
                List.of(" breakfast ", "breakfast", " dinner "),
                " CARB ",
                "  /img/oat.jpg  ",
                380,
                13.2,
                62.1,
                7.5,
                true,
                null
        ));

        ArgumentCaptor<Food> captor = ArgumentCaptor.forClass(Food.class);
        verify(foodRepository).save(captor.capture());
        Food toSave = captor.getValue();

        assertThat(toSave.getName()).isEqualTo("Zabkasa");
        assertThat(toSave.getCategory()).isEqualTo("gabona");
        assertThat(toSave.getRecommendedMeals()).isEqualTo("breakfast,dinner");
        assertThat(toSave.getMacroRole()).isEqualTo("carb");
        assertThat(toSave.getImageUrl()).isEqualTo("/img/oat.jpg");
        assertThat(toSave.getActive()).isTrue();
        assertThat(result.id()).isEqualTo(12L);
        assertThat(result.recommendedMeals()).containsExactly("breakfast", "dinner");
    }

    @Test
    void createFoodRejectsInvalidMacrosAndMissingMeals() {
        FoodDto invalid = new FoodDto(null, "", "", List.of(), "", "", 0, -1.0, 0.0, 0.0, false, true);

        assertThatThrownBy(() -> foodService.createFood(invalid))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("neve");

        FoodDto missingMeals = new FoodDto(null, "Tofu", "protein", List.of(), "protein", "", 120, 13.0, 2.0, 6.0, true, true);
        assertThatThrownBy(() -> foodService.createFood(missingMeals))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ajánlott étkezést");
    }

    @Test
    void updateFoodThrowsNotFoundWhenEntityIsMissing() {
        when(foodRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> foodService.updateFood(99L, validDto()))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void findFoodByNameReturnsFoodOrThrowsNotFound() {
        Food tofu = food("Tofu", "lunch", "protein", true);
        when(foodRepository.findByNameIgnoreCase("tofu")).thenReturn(Optional.of(tofu));
        when(foodRepository.findByNameIgnoreCase("missing")).thenReturn(Optional.empty());

        assertThat(foodService.findFoodByName("tofu")).isSameAs(tofu);
        assertThatThrownBy(() -> foodService.findFoodByName("missing"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("missing");
    }

    private FoodDto validDto() {
        return new FoodDto(null, "Tofu", "protein", List.of("lunch"), "protein", "", 120, 13.0, 2.0, 6.0, true, true);
    }

    private Food food(String name, String meals, String role, boolean active) {
        Food food = new Food();
        food.setName(name);
        food.setCategory("category");
        food.setRecommendedMeals(meals);
        food.setMacroRole(role);
        food.setImageUrl("");
        food.setCaloriesPer100g(120);
        food.setProteinPer100g(13.0);
        food.setCarbsPer100g(2.0);
        food.setFatPer100g(6.0);
        food.setVegetarian(true);
        food.setActive(active);
        return food;
    }
}
