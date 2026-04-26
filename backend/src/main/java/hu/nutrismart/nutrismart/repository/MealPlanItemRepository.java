package hu.nutrismart.nutrismart.repository;

import hu.nutrismart.nutrismart.entity.MealPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealPlanItemRepository extends JpaRepository<MealPlanItem, Long> {
    void deleteByFood_Id(Long foodId);
}
