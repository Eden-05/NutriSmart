package hu.nutrismart.nutrismart.repository;

import hu.nutrismart.nutrismart.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByActiveTrue();
    List<Recipe> findByActiveTrueAndMealTypeIgnoreCase(String mealType);
    Optional<Recipe> findByNameIgnoreCase(String name);
    List<Recipe> findByIngredients_Food_Id(Long foodId);
}
