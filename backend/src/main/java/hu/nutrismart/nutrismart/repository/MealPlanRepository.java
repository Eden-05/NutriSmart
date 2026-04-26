package hu.nutrismart.nutrismart.repository;

import hu.nutrismart.nutrismart.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    Optional<MealPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
}
