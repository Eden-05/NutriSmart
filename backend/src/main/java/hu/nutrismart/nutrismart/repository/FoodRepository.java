package hu.nutrismart.nutrismart.repository;

import hu.nutrismart.nutrismart.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByActiveTrue();
    Optional<Food> findByNameIgnoreCase(String name);
}
