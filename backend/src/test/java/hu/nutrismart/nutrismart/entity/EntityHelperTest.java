package hu.nutrismart.nutrismart.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EntityHelperTest {
    @Test
    void recommendedMealListSplitsTrimsAndDropsEmptyValues() {
        Food food = new Food();
        food.setRecommendedMeals(" reggeli, , ebéd,vacsora ");

        assertThat(food.recommendedMealList()).containsExactly("reggeli", "ebéd", "vacsora");
    }

    @Test
    void recommendedMealListReturnsEmptyListForBlankValue() {
        Food food = new Food();
        food.setRecommendedMeals("   ");

        assertThat(food.recommendedMealList()).isEmpty();
    }

    @Test
    void userConstructorInitializesActiveAndCreatedAtDefaults() {
        User user = new User("user@example.com", "hash", Role.ADMIN);

        assertThat(user.getEmail()).isEqualTo("user@example.com");
        assertThat(user.getPasswordHash()).isEqualTo("hash");
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);
        assertThat(user.getActive()).isTrue();
        assertThat(user.getCreatedAt()).isNotNull();
    }
}
